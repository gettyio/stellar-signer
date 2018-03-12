module.exports = ({ platform }, { module }) => ({
	entry: `./index.${platform}.js`,
	module: {
		...module,
		rules: [
			{
        test: /\.js?$/,
        include: [
          /node_modules\/pouchdb-adapter-asyncstorage/,
          /node_modules\/react-native-vector-icons/
        ],
        use: [
          {
            loader: "babel-loader"
          }
        ]
      },
			{
        test: /\.tsx?$/,
        exclude: '/node_modules/',
        use: [
          {
            loader: 'babel-loader',
          },
          {
            loader: 'ts-loader'
          },
        ],
			},
			...module.rules
		]
	},
});