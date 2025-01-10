import { NextResponse } from 'next/server';
import { PrismaClient } from "@prisma/client"; 

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Fetch the week and its corresponding shifts
    const weeksWithShiftsAndVolunteers = await prisma.weeks.findMany({
        include: {
          shifts: {
            include: {
              volunteers: {
                include: {
                  volunteer: true, // This will include the volunteer details for each shift
                },
              },
            },
          },
        },
      });

      
    console.log(
        JSON.stringify(
          weeksWithShiftsAndVolunteers, // The response object
          null, // No replacer function
          2     // Indentation for readability
        )
      );
      
      if (!weeksWithShiftsAndVolunteers) {
        throw new Error("No data found");
      }
      
    return NextResponse.json(weeksWithShiftsAndVolunteers); // Return the week data as JSON
  } catch (error) {
    console.error("Error fetching weeks and shifts:", error);
    return NextResponse.json({ error: 'Error fetching weeks and shifts' }, { status: 500 });
  }
}
