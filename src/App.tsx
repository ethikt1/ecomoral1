import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { SimulatorView } from './components/SimulatorView';
import { CodeExporterView } from './components/CodeExporterView';
import { DeploymentGuideView } from './components/DeploymentGuideView';
import { ApiSettingsView } from './components/ApiSettingsView';
import { cleanGoogleScriptUrl } from './utils/urlHelper';

export default function App() {
  const [activeTab, setActiveTab] = useState<'simulator' | 'code' | 'guide' | 'settings'>('simulator');
  
  // Persist GAS WebApp URL and Live API state in localStorage
  const [webAppUrl, setWebAppUrlState] = useState<string>(() => {
    try {
      return localStorage.getItem('ecomoral_gas_webapp_url') || '';
    } catch {
      return '';
    }
  });

  const [useLiveApi, setUseLiveApiState] = useState<boolean>(() => {
    try {
      return localStorage.getItem('ecomoral_use_live_api') === 'true';
    } catch {
      return false;
    }
  });

  const setWebAppUrl = (rawUrl: string) => {
    const cleaned = cleanGoogleScriptUrl(rawUrl);
    setWebAppUrlState(cleaned);
    try {
      localStorage.setItem('ecomoral_gas_webapp_url', cleaned);
    } catch (e) {
      console.error('Failed to save webAppUrl to localStorage', e);
    }
  };

  const setUseLiveApi = (use: boolean) => {
    setUseLiveApiState(use);
    try {
      localStorage.setItem('ecomoral_use_live_api', String(use));
    } catch (e) {
      console.error('Failed to save useLiveApi to localStorage', e);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCF8] text-[#344E41] flex flex-col font-sans">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        apiConnected={useLiveApi && Boolean(webAppUrl)}
      />

      <main className="flex-1">
        {activeTab === 'simulator' && (
          <SimulatorView webAppUrl={webAppUrl} useLiveApi={useLiveApi} />
        )}

        {activeTab === 'code' && (
          <CodeExporterView />
        )}

        {activeTab === 'guide' && (
          <DeploymentGuideView />
        )}

        {activeTab === 'settings' && (
          <ApiSettingsView
            webAppUrl={webAppUrl}
            setWebAppUrl={setWebAppUrl}
            useLiveApi={useLiveApi}
            setUseLiveApi={setUseLiveApi}
          />
        )}
      </main>

      <footer className="bg-[#2C3E2D] text-[#A3B18A] text-xs py-6 border-t border-[#344E41] mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-1">
          <p className="font-semibold text-[#E8F0E6]">EcoMoral Lab - 환경 도덕성 진단 및 맞춤형 학습 플랫폼</p>
          <p className="text-[#A3B18A]">Rest의 도덕적 행동 4구성요소 기반 중·고등학생 환경 도덕성 연구 및 맞춤형 도덕성 진단 프로그램</p>
        </div>
      </footer>
    </div>
  );
}
