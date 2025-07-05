module.exports = (options, webpack) => {
  return {
    ...options,
    externals: [],
    module: {
      rules: [
        {
          test: /\.(ts|tsx)$/,
          exclude: /(node_modules)/,
          use: {
            // `.swcrc` can be used to configure swc
            loader: "swc-loader",
          },
        },
      ],
    },
    plugins: [...options.plugins],
  };
};
