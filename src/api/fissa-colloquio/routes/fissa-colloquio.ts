export default {
  routes: [
    {
      method: 'POST',
      path: '/fissa-colloquio',
      handler: 'fissa-colloquio.updateColloquio',
      config: {
        auth: false,
      },
    },
  ],
};
