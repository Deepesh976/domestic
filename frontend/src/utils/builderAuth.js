export function handleBuilderAuth(navigate) {
  const isBuilderEditor =
    window.location !== window.parent.location ||
    navigator.userAgent.includes('Builder');

  if (!isBuilderEditor) return false;

  // 🔥 CHANGE ROLE HERE WHEN DESIGNING
  const mockRole = 'headadmin'; // 'superadmin' | 'headadmin'

  localStorage.setItem('token', 'builder-mock-token');
  localStorage.setItem('role', mockRole);

  if (mockRole === 'superadmin') {
    navigate('/superadmin');
  } else {
    navigate('/headadmin');
  }

  console.log(`Builder mock login as ${mockRole}`);
  return true;
}
