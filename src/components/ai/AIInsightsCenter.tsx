import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Bot,
  Send,
  Users,
  RefreshCw,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export const AIInsightsCenter: React.FC = () => {
  const { kpis, currentOrg, language, t, getKpiLatestSubmission, theme } = useApp();
  const isLight = theme === 'light';

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-init',
      sender: 'assistant',
      text:
        language === 'ar'
          ? `مرحباً بك. أنا المساعد الذكي لقياس وتحليل أداء الموارد البشرية لـ **${currentOrg.nameAr}**.\n\nلقد قمت بتحليل كافة مؤشرات دوران الموظفين الـ 35 المعتمدة لشهر أكتوبر 2026. كيف يمكنني دعم خطتكم الاستراتيجية اليوم؟`
          : `Welcome to the **HR Performance Intelligence Assistant** for **${currentOrg.name}**.\n\nI have evaluated all 35 verified turnover & retention indicators for October 2026. How may I assist your workforce strategy today?`,
      timestamp: 'Just now',
    },
  ]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isThinking, setIsThinking] = useState(false);

  const suggestedPrompts = [
    language === 'ar' ? 'لماذا ارتفع دوران التعيينات الجديدة في سنتهم الأولى؟' : 'Why did new hire turnover during the first year increase?',
    language === 'ar' ? 'ما هي المؤشرات الحرجة التي تتطلب تدخلاً فورياً؟' : 'Which indicators require immediate executive intervention?',
    language === 'ar' ? 'لخص الأداء العام للموارد البشرية لمجلس الإدارة' : 'Summarize overall HR performance for the Board of Directors',
    language === 'ar' ? 'ما هي أولويات التدخل في قسم الهندسة السحابية؟' : 'What are the top retention priorities for Software Engineering?',
  ];

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputPrompt;
    if (!text.trim() || isThinking) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputPrompt('');
    setIsThinking(true);

    try {
      const activeKpis = kpis.slice(0, 10).map(k => {
        const sub = getKpiLatestSubmission(k.id);
        return {
          code: k.code,
          name: k.name,
          actual: sub?.calculatedValue ?? k.targetValue,
          target: k.targetValue,
          unit: k.unit,
          status: sub?.status || 'On Track',
        };
      });

      const res = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          context: {
            organization: currentOrg.name,
            totalEmployees: currentOrg.totalEmployees,
            activeKpis,
          },
          language,
        }),
      });

      const data = await res.json();
      const assistantMsg: ChatMessage = {
        id: `ast-${Date.now()}`,
        sender: 'assistant',
        text: data.reply || 'Data processed successfully.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: `ast-${Date.now()}`,
          sender: 'assistant',
          text:
            language === 'ar'
              ? 'حدث خطأ في الاتصال بنموذج الذكاء الاصطناعي. يُرجى المحاولة لاحقاً.'
              : 'Failed to communicate with the intelligence backend. Please try again.',
          timestamp: 'Now',
        },
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  const cardBg = isLight ? 'bg-white border border-slate-200/90 shadow-xs' : 'bg-slate-900 border border-slate-800 shadow-sm';
  const textPrimary = isLight ? 'text-slate-900' : 'text-slate-100';
  const textMuted = isLight ? 'text-slate-500' : 'text-slate-400';

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className={`text-xl font-bold ${textPrimary} tracking-tight flex items-center gap-2`}>
          <Bot className="w-5 h-5 text-indigo-600" />
          <span>{t('navAiInsights')}</span>
        </h2>
        <p className={`text-xs ${textMuted} mt-0.5`}>
          {language === 'ar'
            ? 'تحليل ذكي فوري لنتائج مؤشرات الأداء، استنتاج الأسباب الجذرية، وتوصيات القيادة المدعومة بنموذج Gemini'
            : 'Gemini-powered strategic workforce diagnostic assistant grounded strictly in verified KPI mathematical values'}
        </p>
      </div>

      {/* Suggested Prompts Buttons */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className={`text-[11px] font-bold uppercase tracking-wider shrink-0 mr-1 rtl:mr-0 rtl:ml-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
          {language === 'ar' ? 'مقترحات الأسئلة:' : 'Suggestions:'}
        </span>
        {suggestedPrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(p)}
            className={`px-3 py-1.5 rounded-lg border font-medium whitespace-nowrap transition-colors ${
              isLight
                ? 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700 shadow-xs'
                : 'bg-slate-900 border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800 text-slate-300'
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Chat Container */}
      <div className={`${cardBg} rounded-xl flex flex-col h-[600px] overflow-hidden`}>
        {/* Messages Scroll Area */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4">
          {messages.map(m => (
            <div
              key={m.id}
              className={`flex items-start gap-3 max-w-2xl ${
                m.sender === 'user' ? 'ml-auto rtl:ml-0 rtl:mr-auto flex-row-reverse' : ''
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                  m.sender === 'user'
                    ? 'bg-blue-600 text-white'
                    : isLight
                    ? 'bg-indigo-50 border border-indigo-200 text-indigo-600'
                    : 'bg-indigo-950 border border-indigo-700/60 text-indigo-400'
                }`}
              >
                {m.sender === 'user' ? <Users className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`p-4 rounded-xl text-xs leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-blue-600 text-white font-semibold'
                    : isLight
                    ? 'bg-slate-50 border border-slate-200 text-slate-800 whitespace-pre-wrap'
                    : 'bg-slate-950 border border-slate-800 text-slate-200 whitespace-pre-wrap'
                }`}
              >
                {m.text}
                <div
                  className={`text-[9px] mt-2 font-mono ${
                    m.sender === 'user' ? 'text-blue-200' : 'text-slate-400'
                  }`}
                >
                  {m.timestamp}
                </div>
              </div>
            </div>
          ))}

          {isThinking && (
            <div className={`flex items-center gap-2 text-xs text-indigo-600 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/80 border-slate-800'} border px-4 py-3 rounded-xl max-w-sm`}>
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600" />
              <span>{language === 'ar' ? 'جارٍ تحليل قاعدة البيانات وتجميع الاتجاهات...' : 'Analyzing workforce database & historical trends...'}</span>
            </div>
          )}
        </div>

        {/* Chat Input Bar */}
        <div className={`p-4 border-t ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'}`}>
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputPrompt}
              onChange={e => setInputPrompt(e.target.value)}
              placeholder={
                language === 'ar'
                  ? 'اطرح سؤالاً حول دوران الموظفين، أسباب الاستقالات، أو توصيات التدخل...'
                  : 'Ask about retention trends, causes of departure, or intervention priorities...'
              }
              className={`flex-1 border rounded-lg px-4 py-2 text-xs focus:outline-none focus:border-indigo-500 ${
                isLight ? 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400' : 'bg-slate-800 border-slate-700 text-slate-200 placeholder:text-slate-500'
              }`}
            />
            <button
              type="submit"
              disabled={isThinking || !inputPrompt.trim()}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'إرسال' : 'Send'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
