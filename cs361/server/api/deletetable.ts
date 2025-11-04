export default defineEventHandler(async (event) => {
    const db = useDatabase('transactionsDB')

    try {
        // Drop the entire transactions table
        await db.sql`DROP TABLE IF EXISTS transactions`;
        return { 
            message: `Transactions table deleted successfully.`,
            success: true 
        };
    } catch (error) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to delete transactions table'
        })
    }
});