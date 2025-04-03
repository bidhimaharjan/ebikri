"use client";

import { useState, useEffect } from "react";

const BusinessName = ({ userId }) => {
  const [businessName, setBusinessName] = useState("Business"); // default to "Business"

  useEffect(() => {
    if (userId) {
      // function to fetch the business name based on userId
      const fetchBusinessName = async () => {
        try {
          const response = await fetch(`/api/businessname?userId=${userId}`);

          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }

          // if a business name exists in the response, update the state
          const data = await response.json();
          if (data.name) {
            setBusinessName(data.name);
          } else {
            console.warn("Business not found.");
          }
        } catch (error) {
          console.error("Error fetching business name:", error);
        }
      };

      fetchBusinessName();
    }
  }, [userId]); // runs whenever the userId changes

  return <span>{businessName}</span>; // render the business name
};

export default BusinessName;
