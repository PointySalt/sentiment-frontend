import { useState } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

function App() {
  // We set a default search that you might want to look up, like a game or a tool!
  const [brandName, setBrandName] = useState("Valorant");
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  // This function runs when you click the search button
  const fetchSentiment = async () => {
    setLoading(true);
    setReport(null); // Clear the old report
    
    try {
      // The frontend "waiter" takes the order to your backend kitchen
      // This tells React: "Use the live URL if we are on the internet, otherwise use localhost"
const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
const response = await axios.get(`${apiUrl}/api/sentiment/${brandName}`);
      setReport(response.data); // Save the AI's response to display it
    } catch (error) {
      console.error("Connection failed:", error);
      alert("Could not connect. Is your backend server running?");
    }
    
    setLoading(false);
  };

  // Colors for our pie chart
  const COLORS = ['#4ade80', '#f87171', '#94a3b8']; 

  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: '800px', margin: '40px auto', padding: '20px' }}>
      <h1>Brutally Honest Sentiment Report</h1>
      
      {/* The Search Bar */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
        <input 
          type="text" 
          value={brandName}
          onChange={(e) => setBrandName(e.target.value)}
          placeholder="Enter a brand or product..."
          style={{ padding: '10px', fontSize: '16px', flex: 1 }}
        />
        <button onClick={fetchSentiment} style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }}>
          {loading ? "Analyzing..." : "Analyze"}
        </button>
      </div>

      {/* The Report Display */}
      {report && (
        <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px' }}>
          <h2>Report for: {brandName}</h2>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {/* The Graph */}
            <div>
              <PieChart width={300} height={300}>
                <Pie
                  data={[
                    { name: 'Positive', value: report.positivePercentage || 33 },
                    { name: 'Negative', value: report.negativePercentage || 33 },
                    { name: 'Neutral', value: report.neutralPercentage || 34 }
                  ]}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {COLORS.map((color, index) => <Cell key={`cell-${index}`} fill={color} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </div>

            {/* The Praises & Complaints */}
            <div style={{ flex: 1, marginLeft: '40px' }}>
              <h3 style={{ color: '#16a34a' }}>Top Praises</h3>
              <ul>
                {report.topPraises?.map((praise, index) => <li key={index}>{praise}</li>)}
              </ul>

              <h3 style={{ color: '#dc2626' }}>Top Complaints</h3>
              <ul>
                {report.topComplaints?.map((complaint, index) => <li key={index}>{complaint}</li>)}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;