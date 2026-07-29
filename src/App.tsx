/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Terminal, ShieldAlert, Cpu, Activity, Database, Key, CheckCircle, AlertTriangle, Copy } from 'lucide-react';

type AuditLog = {
  id: string;
  operation: string;
  details: string;
  timestamp: Date;
  type: 'COMPLEMENT_OP' | 'PATTERN_MATCH' | 'XOR_ANALYSIS' | 'ERROR';
};

export default function App() {
  const [inputSSID, setInputSSID] = useState<string>('fh_aa1678');
  const [inputHex, setInputHex] = useState<string>('AA1678');
  const [complemented, setComplemented] = useState<string>('55E987');
  const [finalPassword, setFinalPassword] = useState<string>('wlan55e987');
  const [auditHistory, setAuditHistory] = useState<AuditLog[]>([
    {
      id: '1',
      operation: 'COMPLEMENT_OP',
      details: '4A91F2 -> B56E0D',
      timestamp: new Date(Date.now() - 10000),
      type: 'COMPLEMENT_OP'
    }
  ]);
  const [entropy, setEntropy] = useState<number>(3.2);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const handleCopy = () => {
    if (finalPassword) {
      navigator.clipboard.writeText(finalPassword);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const calculateComplement = (hex: string) => {
    let result = '';
    for (const char of hex) {
      const val = parseInt(char, 16);
      if (!isNaN(val)) {
        const comp = 15 - val;
        result += comp.toString(16).toUpperCase();
      }
    }
    return result;
  };

  const calculateEntropy = (str: string) => {
    if (!str) return 0;
    const charCounts: Record<string, number> = {};
    for (const char of str) {
      charCounts[char] = (charCounts[char] || 0) + 1;
    }
    let ent = 0;
    for (const count of Object.values(charCounts)) {
      const p = count / str.length;
      ent -= p * Math.log2(p);
    }
    return parseFloat(ent.toFixed(1));
  };

  const handleRunComplement = () => {
    // Extract last 6 hex chars if possible, otherwise just use what we can
    const clean = inputSSID.trim();
    let hexToProcess = clean;
    
    // Try to find a 6 char hex string at the end
    const suffixMatch = clean.match(/([0-9a-fA-F]{6})$/);
    if (suffixMatch) {
      hexToProcess = suffixMatch[1];
    } else {
      // Just extract all hex chars
      hexToProcess = clean.replace(/[^0-9a-fA-F]/g, '');
    }

    if (!hexToProcess) {
      addAuditLog('ERROR', 'Invalid input format');
      return;
    }

    const upperHex = hexToProcess.toUpperCase();
    const compResult = calculateComplement(upperHex);
    const passResult = `wlan${compResult.toLowerCase()}`;
    
    setInputHex(upperHex);
    setComplemented(compResult);
    setFinalPassword(passResult);
    setEntropy(calculateEntropy(compResult));

    addAuditLog('COMPLEMENT_OP', `${upperHex} -> ${compResult}`);
    addAuditLog('PATTERN_MATCH', `DETERMINISTIC_MODEL_01`);
  };

  useEffect(() => {
    const clean = inputSSID.trim();
    let hexToProcess = clean;
    
    const suffixMatch = clean.match(/([0-9a-fA-F]{6})$/);
    if (suffixMatch) {
      hexToProcess = suffixMatch[1];
    } else {
      hexToProcess = clean.replace(/[^0-9a-fA-F]/g, '');
    }

    if (hexToProcess) {
      const upperHex = hexToProcess.toUpperCase();
      const compResult = calculateComplement(upperHex);
      const passResult = `wlan${compResult.toLowerCase()}`;
      
      setInputHex(upperHex);
      setComplemented(compResult);
      setFinalPassword(passResult);
      setEntropy(calculateEntropy(compResult));
    }
  }, [inputSSID]);

  const addAuditLog = (type: AuditLog['type'], details: string) => {
    const newLog: AuditLog = {
      id: Math.random().toString(36).substring(7),
      operation: type,
      details,
      timestamp: new Date(),
      type
    };
    setAuditHistory(prev => [newLog, ...prev].slice(0, 10)); // keep last 10
  };

  const getLogColor = (type: AuditLog['type']) => {
    switch (type) {
      case 'COMPLEMENT_OP': return 'text-indigo-400';
      case 'PATTERN_MATCH': return 'text-orange-400';
      case 'XOR_ANALYSIS': return 'text-purple-400';
      case 'ERROR': return 'text-red-400';
      default: return 'text-neutral-500';
    }
  };

  return (
    <div className="bg-neutral-950 text-neutral-100 min-h-screen p-4 md:p-8 flex flex-col font-sans overflow-x-hidden md:overflow-hidden">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-indigo-400 flex items-center gap-2">
            <Terminal className="w-6 h-6" />
            Fibre Mosta
          </h1>
        </div>
        <div className="flex gap-4">
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-12 grid-rows-none md:grid-rows-6 gap-4 flex-grow">
        
        {/* Primary Control Card */}
        <div className="md:col-span-8 md:row-span-3 bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            
            <div className="mb-6">
              <span className="text-[10px] text-neutral-400 uppercase font-mono mb-1 block">nom de wifi:</span>
              <input 
                type="text" 
                value={inputSSID}
                onChange={(e) => setInputSSID(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-3 text-lg font-mono text-neutral-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="e.g. fh_aa1678"
              />
            </div>

            <div className="mt-4">
               <span className="text-[10px] text-indigo-400 uppercase font-mono mb-1 block">mot de passe:</span>
               <div className="bg-green-950/20 border border-green-500/30 rounded-lg p-3 text-lg font-mono text-green-400 flex items-center justify-between">
                 <span>{finalPassword || '...'}</span>
                 <button
                   onClick={handleCopy}
                   className={`transition-all duration-300 p-1 ${isCopied ? 'text-green-300 scale-110' : 'text-green-500 hover:text-green-400'}`}
                   title="Copier"
                 >
                   {isCopied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                 </button>
               </div>
            </div>
          </div>
          
          <div className="flex flex-col gap-2 mt-6 text-center bg-indigo-950/20 border border-indigo-900/40 rounded-xl p-4">
            <p className="text-sm font-semibold text-indigo-300">This app works just with the fiber-optic Wi-Fis</p>
            <p className="text-sm font-semibold text-indigo-300">Cette application ne fonctionne qu'avec les Wi-Fi fibre optique</p>
            <p className="text-sm font-semibold text-indigo-300">هذا التطبيق يعمل فقط مع شبكات الواي فاي ذات الألياف الضوئية</p>
          </div>
        </div>
      </div>
    </div>
  );
}

