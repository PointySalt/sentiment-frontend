import { useState, useEffect } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

function App() {
  const [brandName, setBrandName] = useState("");
  const [customText, setCustomText] = useState("");
  const [report, setReport] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

  // Fetch history when page loads
  const fetchHistory = async () => {
    try {
      const res = await axios.get(`${apiUrl}/api/history`);
      setHistory(res.data);
    } catch (err) {
      console.error("Could not fetch history");
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [report]);

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!brandName) return alert("Please enter a product or brand name");
    setLoading(true);
    setReport(null);

    try {
      const response = await axios.post(`${apiUrl}/api/sentiment`, {
        brandName,
        customText: customText.trim() || null
      });
      setReport(response.data);
      setCustomText(""); // clear input
    } catch (error) {
      console.error(error);
      alert("Analysis failed. Check if backend is awake.");
    }
    setLoading(false);
  };

  const COLORS = ['#4ade80', '#f87171', '#94a3b8'];

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', maxWidth: '900px', margin: '40px auto', padding: '20px', color: '#1e293b' }}>
      <header style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>⚡ Brutally Honest Sentiment AI</h1>
        <p style={{ color: '#64748b' }}>Analyze market sentiment instantly or paste custom raw reviews.</p>
      </header>

      <div style={{ display: 'grid', gap: '30px' }}>
        {/* Input Form Card */}
        <div style={{ background: '#ffffff', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
          <form onSubmit={handleAnalyze}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>Brand / Product Name</label>
            <input 
              type="text"
              placeholder="e.g. Red Dead Redemption 2, iPhone 15, Notion..."
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              style={{ width: '100%', padding: '12px', fontSize: '16px', borderRadius: '6px', border: '1px solid #cbd5e1', marginBottom: '20px', boxSizing: 'border-box' }}
            />

            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>Paste Raw Reviews / Feedback (Optional)</label>
            <textarea 
              rows="5"
              placeholder="Leave blank for a general web scan, or paste specific text/customer comments here to analyze them specifically..."
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              style={{ width: '100%', padding: '12px', fontSize: '15px', borderRadius: '6px', border: '1px solid #cbd5e1', marginBottom: '20px', boxSizing: 'border-box', resize: 'vertical' }}
            />

            <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', fontSize: '16px', fontWeight: 'bold', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', transition: 'background 0.2s' }}>
              {loading ? "Analyzing Context via Gemini AI..." : "Generate Sentiment Report"}
            </button>
          </form>
        </div>
{/* Results Visualizer Section */}
        {report && (
          <div style={{ background: '#f8fafc', padding: '30px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <h2 style={{ marginTop: 0, borderBottom: '2px solid #e2e8f0', paddingBottom: '10px' }}>
              📊 Analytics Report: {report.brandName}
            </h2>

            {/* AI Verdict Summary */}
            <div style={{ background: '#fff', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #3b82f6', marginBottom: '25px' }}>
              <h4 style={{ margin: '0 0 5px 0', color: '#1e293b' }}>🤖 AI Verdict</h4>
              <p style={{ margin: 0, color: '#475569', lineHeight: '1.5' }}>{report.aiVerdict || "Not enough data to form a definitive verdict."}</p>
            </div>

            {/* Main Graph & Lists Layout */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '40px', alignItems: 'flex-start' }}>
              
              {/* Pie Chart with Fallback Data */}
              <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <PieChart width={280} height={240}>
                  <Pie
                    data={[
                      { name: 'Positive', value: report.positivePercentage || 1 }, // Fallback to 1 so chart always renders
                      { name: 'Negative', value: report.negativePercentage || 1 },
                      { name: 'Neutral', value: report.neutralPercentage || 1 }
                    ]}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {COLORS.map((color, index) => <Cell key={`cell-${index}`} fill={color} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </div>

              {/* Text Lists */}
              <div style={{ flex: 1, minWidth: '280px' }}>
                <h3 style={{ color: '#16a34a', marginBottom: '5px' }}>🟢 Top Praises</h3>
                <ul style={{ paddingLeft: '20px', margin: '0 0 20px 0', color: '#334155' }}>
                  {report.topPraises?.length > 0 
                    ? report.topPraises.map((p, i) => <li key={i} style={{ marginBottom: '4px' }}>{p}</li>)
                    : <li>No distinct praises found.</li>}
                </ul>
                
                <h3 style={{ color: '#dc2626', marginBottom: '5px' }}>🔴 Top Complaints</h3>
                <ul style={{ paddingLeft: '20px', margin: 0, color: '#334155' }}>
                  {report.topComplaints?.length > 0 
                    ? report.topComplaints.map((c, i) => <li key={i} style={{ marginBottom: '4px' }}>{c}</li>)
                    : <li>No major complaints detected.</li>}
                </ul>
              </div>
            </div>

            {/* Deep Analytics Tags */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #e2e8f0' }}>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#475569' }}>💡 Trending Keywords</h4>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {report.trendingKeywords?.map((kw, i) => (
                    <span key={i} style={{ background: '#e2e8f0', padding: '4px 10px', borderRadius: '15px', fontSize: '13px', fontWeight: '500' }}>#{kw}</span>
                  ))}
                </div>
              </div>

              <div style={{ flex: 1, minWidth: '200px' }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#475569' }}>🎭 Key Emotions Detected</h4>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {report.keyEmotions?.map((em, i) => (
                    <span key={i} style={{ background: '#fef3c7', color: '#b45309', padding: '4px 10px', borderRadius: '15px', fontSize: '13px', fontWeight: '500' }}>{em}</span>
                  ))}
                </div>
              </div>
            </div>

          </div>
        )}
     
        {/* Recent Search History Ledger */}
        {history.length > 0 && (
          <div style={{ marginTop: '20px' }}>
            <h3 style={{ color: '#475569' }}>🕒 Recently Tracked Profiles</h3>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {history.map((item, idx) => (
                <div key={idx} onClick={() => setReport(item)} style={{ background: '#edf2f7', padding: '8px 16px', borderRadius: '20px', cursor: 'pointer', fontSize: '14px', fontWeight: '500', transition: 'background 0.2s' }}>
                  {item.brandName} ({item.positivePercentage}% Pos)
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
