/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  // Allow importing from parent directory (the package source)
  transpilePackages: ['@panrafal/agentation'],
};

module.exports = nextConfig;
