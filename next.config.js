require('dotenv').config()
/** @type {import('next').NextConfig} */
const nextConfig  = {
    output: 'standalone',
    env: {
        // Reference a variable that was defined in the .env file and make it available at Build Time
        API_ENDPOINT: process.env.API_ENDPOINT,
        // NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
      },
}

module.exports = nextConfig
