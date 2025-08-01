const { createPostGraphileSchema } = require('postgraphile');
const { writeFileSync } = require('fs');
const { printSchema } = require('graphql'); // Import the correct function

// Database connection string
const connectionString = 'postgres://postgres:soham@localhost:5432/family_finance_db';

// PostGraphile options for schema generation
const options = {
    schemas: ['public'],
    graphileBuildOptions: {
        pgSkipInstallingDevMigrations: true,
    },
};

async function exportSchema() {
    try {
        console.log('Connecting to database and generating GraphQL schema...');

        // Generate the GraphQL schema object
        const gqlSchema = await createPostGraphileSchema(
            connectionString,
            options.schemas,
            options.graphileBuildOptions
        );

        // Write the schema to a file
        const schemaString = printSchema(gqlSchema); // Correctly convert the schema object to a string
        writeFileSync('my-schema.graphql', schemaString);

        console.log('GraphQL schema successfully exported to my-schema.graphql');
        process.exit(0);
    } catch (err) {
        console.error('Error generating or exporting schema:', err);
        process.exit(1);
    }
}

// Run the function
exportSchema();