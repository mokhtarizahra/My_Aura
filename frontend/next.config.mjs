/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    dirs: ['app', 'components', 'lib', 'services', 'types', 'constants', 'hooks', 'context'],
  },
};
export default nextConfig;
