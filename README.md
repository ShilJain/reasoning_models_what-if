# What-If Analysis with reasoning models

This React application demonstrates integration with Azure OpenAI API, featuring a tabbed interface for different use cases. The current implementation includes a "Preventive Maintenance with Resource Optimization" tab where users can input queries and receive AI-powered recommendations.

## Features

- **Tabbed Interface**: Easy navigation between different AI analysis tools
- **Preventive Maintenance Tab**: Submit queries related to maintenance and resource optimization
- **Azure OpenAI Integration**: Leverages Azure's powerful language models for accurate recommendations
- **Responsive Design**: Works on both desktop and mobile devices

## Azure OpenAI Setup

Before running the application, you need to configure your Azure OpenAI credentials:

1. Create an Azure OpenAI Service resource in your Azure account
2. Deploy a model (e.g., o1, o3, o4-mini) 
3. Copy your Azure OpenAI endpoint, API key, and deployment name
4. Update the `.env` file with these values:
   ```
   REACT_APP_AZURE_OPENAI_ENDPOINT=your_azure_openai_endpoint
   REACT_APP_AZURE_OPENAI_KEY=your_azure_openai_key
   REACT_APP_AZURE_OPENAI_DEPLOYMENT=your_azure_openai_deployment_name
   ```

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
