// src/api/gestisci-aziendale/routes/gestisci-aziendale.ts
export default {
  routes: [
    {
      method: 'POST',
      path: '/gestisci-aziendale',
      handler: 'gestisci-aziendale.handle',
      config: {
        auth: false,
      },
    },
  ],
};
