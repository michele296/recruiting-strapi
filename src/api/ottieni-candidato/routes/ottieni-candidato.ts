export default {
  routes: [
    {
      method: 'GET',
      path: '/ottieni-candidato/:id',
      handler: 'ottieni-candidato.find',
      config: {
        auth: false,
      },
    },
  ],
};
