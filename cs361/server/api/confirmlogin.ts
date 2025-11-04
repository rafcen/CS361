import { verifyPassword } from '../utils/password'

export default defineEventHandler(async (event) => {
    const requestbody = await readBody(event)
    
    if (!requestbody.username || !requestbody.password) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Username and password are required'
        })
    }
    
    const db = useDatabase()
    
    try {
        const result = await db.sql`SELECT username, password FROM users WHERE username = ${requestbody.username}`
        
        if (result.rows.length === 0) {
            throw createError({
                statusCode: 401,
                statusMessage: 'Invalid username or password'
            })
        }
        
        const user = result.rows[0]
        
        // Verify the plain password against the hashed password
        const isValidPassword = await verifyPassword(requestbody.password, user.password)
        
        if (!isValidPassword) {
            throw createError({
                statusCode: 401,
                statusMessage: 'Invalid username or password'
            })
        }
        
        return { 
            message: `Login successful for ${user.username}`,
            success: true,
            username: user.username
        }
        
    } catch (error: any) {
        console.error('Login error:', error)
        
        if (error.statusCode) {
            throw error
        }
        
        throw createError({
            statusCode: 500,
            statusMessage: 'Login failed'
        })
    }
})