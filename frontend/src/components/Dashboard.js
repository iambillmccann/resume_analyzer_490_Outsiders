import React, { useState } from 'react';
import { ProgressBar, ListGroup, Card } from 'react-bootstrap';
import { PieChart, Pie, Cell, Tooltip } from 'recharts';
import ResumeForm from './ResumeForm';

function Dashboard() {  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  // Simulated API call
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Simulate API call with a timeout
      const response = await new Promise((resolve) =>
        setTimeout(() => resolve({ data: "Sample API Data" }), 2000)
      );
      setData(response.data);
    } catch (err) {
      setError("Failed to fetch data. Try again");
    } finally {
      setLoading(false);
    }
  };

  const [fitScore, setFitScore] = useState({
    total: 0,
    matched: 0,
    partial: 0,
    missing: 0
  });
  const [matchedSkills, setMatchedSkills] = useState([]);
  const [improvementSuggestions, setImprovementSuggestions] = useState([]);
  // const { fitScore, matchedSkills, improvementSuggestions } = data;

  // const fitScore = {
  //   total: 75,
  //   matched: 50,
  //   partial: 15,
  //   missing: 35,
  // }
  // const matchedSkills = ['JavaScript', 'React'];
  // const improvementSuggestions = ['Add proficiency in Python.'];

  // Pie chart color scheme
  const COLORS = ['#28a745', '#ffc107', '#dc3545'];

  // Data for Pie Chart
  const fitData = [
    { name: 'Matched Skills', value: fitScore.matched },
    { name: 'Partial Matches', value: fitScore.partial },
    { name: 'Missing Skills', value: fitScore.missing },
  ];

  return (
    <div className="container my-4">
      <ResumeForm
        setFitScore={setFitScore}
        setMatchedSkills={setMatchedSkills}
        setImprovementSuggestions={setImprovementSuggestions}
        setLoading={setLoading}
      />
      {loading && <div className="spinner"></div>}
      <h2>Resume Analysis Dashboard</h2>

      {/* Resume Fit Score */}
      <Card className="mb-4">
        <Card.Body>
          <Card.Title>Resume Fit Score</Card.Title>
          <h4>{fitScore.total}% Match</h4>
          <ProgressBar now={fitScore.total} label={`${fitScore.total}%`} />
          <div className="mt-3">
            <h6>Skills Breakdown:</h6>
            <PieChart width={300} height={200}>
              <Pie
                data={fitData}
                cx={150}
                cy={100}
                innerRadius={40}
                outerRadius={80}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
              >
                {fitData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </div>
        </Card.Body>
      </Card>

      {/* Skills and Keywords Matched */}
      <Card className="mb-4">
        <Card.Body>
          <Card.Title>Skills and Keywords Matched</Card.Title>
          <ListGroup>
            {matchedSkills.map((skill, index) => (
              <ListGroup.Item key={index}>
                <span className="text-success">✔</span> {skill}
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Card.Body>
      </Card>

      {/* Improvement Suggestions */}
      <Card>
        <Card.Body>
          <Card.Title>Improvement Suggestions</Card.Title>
          <ListGroup>
            {improvementSuggestions.map((suggestion, index) => (
              <ListGroup.Item key={index}>
                <span className="text-danger">⚠</span> {suggestion}
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Card.Body>
      </Card>
    </div>
  );
}

export default Dashboard;