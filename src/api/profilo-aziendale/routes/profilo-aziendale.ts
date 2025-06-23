export default {
  routes: [
    {
      method: 'PUT',
      path: '/profilo-aziendale/:aziendaId',
      handler: 'profilo-aziendale.update',
      config: {
        auth: false,
      },
    },
  ],
};
