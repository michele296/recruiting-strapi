export default {
  routes: [
    {
      method: 'POST',
      path: '/cambia-password',
      handler: 'cambia-password.cambiaPassword',
      config: {
        policies: [],
        auth: false
      }
    }
  ]
};
