import React from 'react';
import { Helmet } from 'react-helmet';
import AgentBuilder from '@/components/agents/builder/AgentBuilder';

const AgentBuilderPage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Agent Builder - Neutrinos AI Agent Studio</title>
        <meta 
          name="description" 
          content="Build and configure AI agents for insurance workflows with component-based architecture" 
        />
      </Helmet>
      
      <div className="h-full overflow-hidden">
        <AgentBuilder />
      </div>
    </>
  );
};

export default AgentBuilderPage;