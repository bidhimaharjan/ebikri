import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { NextResponse } from 'next/server';
import { db } from '@/src/index';
import { marketingTable } from '@/src/db/schema/marketing';
import { eq, and } from 'drizzle-orm';

// update a marketing campaign
export async function PUT(request, { params }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json(
      { message: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const { id } = await params;
    const updateData = await request.json();

    if (!id) {
      return NextResponse.json(
        { message: 'Campaign ID is required' },
        { status: 400 }
      );
    }

    // validate dates if they're being updated
    if (updateData.startDate || updateData.endDate) {
      const startDate = updateData.startDate ? new Date(updateData.startDate) : undefined;
      const endDate = updateData.endDate ? new Date(updateData.endDate) : undefined;
      
      if (startDate && endDate && startDate > endDate) {
        return NextResponse.json(
          { message: 'End date must be after start date' },
          { status: 400 }
        );
      }
    }

    // update campaign
    const [updatedCampaign] = await db
      .update(marketingTable)
      .set({
        ...updateData,
        ...(updateData.startDate && { startDate: new Date(updateData.startDate) }),
        ...(updateData.endDate && { endDate: new Date(updateData.endDate) }),
        active: determineActiveStatus(updateData.startDate, updateData.endDate)
      })
      .where(
        and(
          eq(marketingTable.id, parseInt(id)),
          eq(marketingTable.businessId, session.user.businessId)
        )
      )
      .returning();

    if (!updatedCampaign) {
      return NextResponse.json(
        { message: 'Campaign not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Campaign updated successfully', campaign: updatedCampaign },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating campaign:', error);
    return NextResponse.json(
      { message: 'Error updating campaign', error: error.message },
      { status: 500 }
    );
  }
}

// delete a marketing campaign
export async function DELETE(request, { params }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json(
      { message: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { message: 'Campaign ID is required' },
        { status: 400 }
      );
    }

    const [deletedCampaign] = await db
      .delete(marketingTable)
      .where(
        and(
          eq(marketingTable.id, parseInt(id)),
          eq(marketingTable.businessId, session.user.businessId)
        )
      )
      .returning();

    if (!deletedCampaign) {
      return NextResponse.json(
        { message: 'Campaign not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Campaign deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting campaign:', error);
    return NextResponse.json(
      { message: 'Error deleting campaign', error: error.message },
      { status: 500 }
    );
  }
}

// helper function to determine active status
function determineActiveStatus(startDate, endDate) {
  const now = new Date();
  const start = startDate ? new Date(startDate) : null;
  const end = endDate ? new Date(endDate) : null;
  
  if (start && end) {
    return now >= start && now <= end;
  }
  return false;
}