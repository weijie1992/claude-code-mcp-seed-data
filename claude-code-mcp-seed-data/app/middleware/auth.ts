export default defineNuxtRouteMiddleware((to, from) => {
  // Get user session from nuxt-auth-utils
  const { user } = useUserSession();

  // Check if user is authenticated
  const isAuthenticated = !!user.value;

  // Define which routes require authentication
  const protectedRoutes = ['/'];

  // Define auth routes (login, register)
  const authRoutes = ['/login', '/register'];

  console.log('Middleware check:', { to: to.fullPath, isAuthenticated });
  // If trying to access a protected route while not authenticated
  if (protectedRoutes.includes(to.path) && !isAuthenticated) {
    return navigateTo({
      path: '/login',
      query: { redirect: to.fullPath }
    });
  }

  // If trying to access auth routes while already authenticated
  if (authRoutes.includes(to.path) && isAuthenticated) {
    return navigateTo('/');
  }
});
