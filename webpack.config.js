module.exports = (options, webpack) => {
	return {
		...options,
		externals: [
			"@aws-sdk/client-ssm",
			"@aws-sdk/rds-signer",
			"@nestjs/common",
			"@nestjs/core",
			"@nestjs/platform-express",
			"@nestjs/swagger",
			"@prisma/client",
			"aws-serverless-express",
			"axios",
			"class-transformer",
			"class-validator",
			"express",
			"reflect-metadata",
			"rxjs",
			"tslib",
			"uid",
			"prisma",
		],
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
