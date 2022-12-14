module.exports = ({ env }) => ({
  seo: {
    enabled: true,
  },
  upload: {
    config: {
      provider: "local",
      providerOptions: {
        sizeLimit: 100000,
      },
    },
  },
  placeholder: {
    enabled: true,
    config: {
      size: 10,
    },
  },
});
