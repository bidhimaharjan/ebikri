"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import Navbar from "@/components/navbar";
import { UserCircleIcon, PlusIcon, MagnifyingGlassIcon, PaperAirplaneIcon, PencilIcon, TrashIcon, Bars3Icon } from "@heroicons/react/24/outline";
import BusinessName from "@/components/businessname";
import Pagination from "@/components/pagination";
import AddCampaignForm from "@/components/marketing/add-campaign-form";
import EditCampaignForm from "@/components/marketing/edit-campaign-form";
import ConfirmationDialog from "@/components/confirmation-dialog";
import { toast } from "react-toastify";
import Link from 'next/link';

const MarketingLayout = () => {
  const [isNavbarOpen, setIsNavbarOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] = useState(false);
  const [campaignToDelete, setCampaignToDelete] = useState(null);
  const [sendingCampaigns, setSendingCampaigns] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const { data: session, status } = useSession();
  const [campaigns, setCampaigns] = useState([]);
  const rowsPerPage = 9;

  // toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobileMenuOpen && !event.target.closest('.mobile-menu-container')) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileMenuOpen]);

  // function to fetch marketing campaigns data
  const fetchCampaigns = async () => {
    console.log("Fetching campaigns...");

    try {
      const response = await fetch(
        `/api/marketing?businessId=${session.user.businessId}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch marketing campaigns");
      }

      const data = await response.json();
      setCampaigns(data);
    } catch (error) {
      console.error("Error fetching marketing campaigns:", error);
      toast.error("Failed to load campaigns");
    }
  };

  // fetch marketing data on component mount
  useEffect(() => {
    if (session) {
      fetchCampaigns();
    }
  }, [session]);

  // handle Edit button click
  const handleEdit = (campaign) => {
    setSelectedCampaign(campaign);
    setIsEditFormOpen(true);
  };

  // handle Delete button click
  const handleDelete = async (campaignId) => {
    try {
      const response = await fetch(`/api/marketing/${campaignId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Campaign deleted successfully!");
        fetchCampaigns();
      } else {
        toast.error("Error deleting campaign");
      }
    } catch (error) {
      console.error("Error deleting campaign:", error);
    }
  };

  // handle Send button click
  const handleSend = async (campaignId) => {
    setSendingCampaigns((prev) => ({ ...prev, [campaignId]: true }));

    try {
      const response = await fetch("/api/marketing/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ campaignId }),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(
          `Emails sent: ${result.sent}. Failed: ${result.failed}. ` +
            (result.failed > 0 ? "Check console for details." : "")
        );
        if (result.failed > 0) {
          console.log("Failed emails:", result.errors);
        }
      } else {
        toast.error(result.message || "Error sending emails");
      }
    } catch (error) {
      console.error("Error sending emails:", error);
      toast.error("Failed to send emails");
    } finally {
      setSendingCampaigns((prev) => ({ ...prev, [campaignId]: false }));
    }
  };

  // filter campaigns based on search query and sort campaigns (active first, then inactive)
  const filteredCampaigns = campaigns
    .filter((campaign) => {
      const isStatusMatch =
        !searchQuery ||
        (searchQuery.toLowerCase() === "active" && campaign.active) ||
        (searchQuery.toLowerCase() === "inactive" && !campaign.active);

      return (
        isStatusMatch ||
        campaign.campaignName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    })
    .sort((a, b) => {
      // sort by active status first (active comes before inactive)
      if (a.active === b.active) {
        // if same status, sort by creation date
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      return a.active ? -1 : 1;
    });

  // calculate total pages
  const totalPages = Math.ceil(filteredCampaigns.length / rowsPerPage);

  // format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>You are not authenticated. Please log in to access the marketing campaigns.</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      {/* Navigation Bar - Desktop */}
      <Navbar isNavbarOpen={isNavbarOpen} setIsNavbarOpen={setIsNavbarOpen} />

      {/* Main Content Area */}
      <div className="flex-1 bg-gray-100 p-4 md:p-10 overflow-y-auto">
        {/* Mobile Header */}
        <div className="md:hidden flex justify-between items-center mb-4">
          {/* Mobile Menu Button */}
          <button 
            onClick={toggleMobileMenu}
            className="p-2 rounded-md text-gray-700 hover:bg-gray-200"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
          
          {/* Profile Button - Mobile */}
          <Link href="/profile" passHref prefetch>
            <button className="flex items-center px-3 py-1 bg-white text-purple-400 font-bold border border-purple-400 rounded-full hover:bg-purple-400 hover:text-white">
              <UserCircleIcon className="h-4 w-4 mr-1" />
              <BusinessName userId={session.user.id} />
            </button>
          </Link>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="mobile-menu-container md:hidden fixed inset-0 z-50 bg-white p-4 shadow-lg">
            <Navbar 
              isNavbarOpen={true} 
              setIsNavbarOpen={setIsMobileMenuOpen} 
              mobileView={true}
            />
          </div>
        )}

        {/* Profile Button - Desktop */}
        <div className="hidden md:flex justify-end mb-2">
          <Link href="/profile" passHref prefetch>
            <button className="flex items-center px-4 py-2 bg-white text-purple-400 font-bold border border-purple-400 rounded-full hover:bg-purple-400 hover:text-white">
              <UserCircleIcon className="h-5 w-5 mr-2" />
              <BusinessName userId={session.user.id} />
            </button>
          </Link>
        </div>

        {/* Marketing Title */}
        <div className="relative mb-4">
          <h1 className="text-xl font-semibold text-gray-800 mt-2">
            Marketing Tools
          </h1>
          <p className="text-gray-600">Create and manage marketing campaigns to boost your sales</p>
        </div>

        {/* Search and Add Campaign */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4 md:gap-0">
          {/* Add Campaign Button */}
          <button
            className="w-full md:w-auto h-10 px-4 py-2 bg-purple-500 text-white text-sm rounded-md flex items-center justify-center hover:bg-purple-400"
            onClick={() => setIsAddFormOpen(true)}
          >
            <PlusIcon className="h-4 w-4 mr-1" /> 
            <span className="md:hidden">Create Campaign</span>
            <span className="hidden md:inline">Create</span>
          </button>
          
          {/* Search Bar */}
          <div className="w-full md:w-1/3 relative">
            <input
              type="text"
              placeholder="Search campaigns..."
              className="w-full h-10 px-4 pl-10 py-2 text-sm border-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-gray-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
          </div>
        </div>

        {/* Campaigns Table */}
        <div className="overflow-x-auto bg-white p-4 shadow-md rounded-lg">
          <table className="w-full min-w-[800px] md:min-w-full border-collapse">
            <thead>
              <tr className="text-gray-800 text-center border-b">
                <th className="px-4 py-2">ID</th>
                <th className="px-4 py-2 w-[190px]">Campaign Name</th>
                <th className="px-4 py-2">Discount %</th>
                <th className="px-4 py-2">Promo Code</th>
                <th className="px-4 py-2">Duration</th>
                <th className="px-4 py-2">Recipients</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCampaigns
                .slice(
                  (currentPage - 1) * rowsPerPage,
                  currentPage * rowsPerPage
                )
                .map((campaign) => (
                  <tr key={campaign.id} className="border-b">
                    <td className="px-4 py-2 text-center">{campaign.id}</td>
                    <td className="px-4 py-2">{campaign.campaignName}</td>
                    <td className="px-4 py-2 text-center">
                      {parseFloat(campaign.discountPercent)}%
                    </td>
                    <td className="px-4 py-2 text-center">
                      {campaign.promoCode}
                    </td>
                    <td className="px-4 py-2 text-center">
                      {formatDate(campaign.startDate)} -{" "}
                      {formatDate(campaign.endDate)}
                    </td>
                    <td className="px-4 py-2 text-center">
                      {campaign.recipients === "all"
                        ? "All Customers"
                        : "Selected Customers"}
                    </td>
                    <td className="px-4 py-2 text-center">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          campaign.active
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {campaign.active ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td className="px-4 py-2 border-b">
                      <div className="flex justify-center space-x-2 h-full items-center">
                        {/* Send Button with Tooltip */}
                        <div className="relative group">
                          <button
                            className={`px-4 py-1 text-sm rounded-md flex items-center ${
                              campaign.active
                                ? "bg-green-500 text-white hover:bg-green-600"
                                : "bg-gray-300 text-gray-500 cursor-not-allowed"
                            }`}
                            onClick={() =>
                              campaign.active && handleSend(campaign.id)
                            }
                            disabled={
                              !campaign.active || sendingCampaigns[campaign.id]
                            }
                          >
                            <PaperAirplaneIcon className="h-4 w-4 mr-1" />
                            {sendingCampaigns[campaign.id]
                              ? "Sending..."
                              : campaign.active
                              ? "Send"
                              : "Send"}
                          </button>
                          <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-700 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                            {campaign.active
                              ? "Send campaign emails"
                              : "Campaign is inactive"}
                          </span>
                        </div>

                        {/* Edit Button */}
                        <div className="relative group">
                          <button
                            className="p-1 border border-blue-300 rounded-md text-blue-400 hover:text-blue-500 hover:border-blue-500 hover:bg-blue-50"
                            onClick={() => handleEdit(campaign)}
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>
                          <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-700 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                            Edit
                          </span>
                        </div>

                        {/* Delete Button */}
                        <div className="relative group">
                          <button
                            className="p-1 border border-red-500 rounded-md text-red-500 hover:text-red-600 hover:border-red-500 hover:bg-red-50"
                            onClick={() => {
                              setCampaignToDelete(campaign.id);
                              setIsConfirmationDialogOpen(true);
                            }}
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                          <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-700 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                            Delete
                          </span>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          rowsPerPage={rowsPerPage}
          data={filteredCampaigns}
        />

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm mt-2">
          &copy; {new Date().getFullYear()} eBikri. All Rights Reserved
        </div>

        {/* Add Campaign Form */}
        <AddCampaignForm
          isOpen={isAddFormOpen}
          onClose={() => setIsAddFormOpen(false)}
          onConfirm={fetchCampaigns}
        />

        {/* Edit Campaign Form */}
        <EditCampaignForm
          isOpen={isEditFormOpen}
          onClose={() => setIsEditFormOpen(false)}
          onConfirm={fetchCampaigns}
          campaign={selectedCampaign}
        />

        {/* Confirmation Dialog */}
        <ConfirmationDialog
          isOpen={isConfirmationDialogOpen}
          onClose={() => setIsConfirmationDialogOpen(false)}
          onConfirm={() => {
            handleDelete(campaignToDelete);
            setIsConfirmationDialogOpen(false);
          }}
          message="Are you sure you want to delete this campaign?"
        />
      </div>
    </div>
  );
};

export default MarketingLayout;