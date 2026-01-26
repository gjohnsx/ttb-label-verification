import "dotenv/config";
import prisma from "../lib/prisma";

async function testDatabase() {
  console.log("Testing Azure SQL connection via Prisma...\n");

  try {
    // Test 1: Basic query to verify connection
    console.log("1. Testing connection...");
    const result = await prisma.$queryRaw`SELECT 1 as connected`;
    console.log("   Connected to database!\n");

    // Test 2: Count applications
    console.log("2. Counting applications...");
    const count = await prisma.application.count();
    console.log(`   Found ${count} application(s)\n`);

    // Test 3: List first few applications (if any)
    if (count > 0) {
      console.log("3. Fetching sample applications...");
      const apps = await prisma.application.findMany({
        take: 3,
        select: {
          id: true,
          brandName: true,
          status: true,
        },
      });
      apps.forEach((app) => {
        console.log(`   - ${app.brandName} (${app.status})`);
      });
      console.log();
    }

    console.log("All tests passed! Database is working.\n");
  } catch (error) {
    console.error("Database test failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase();
