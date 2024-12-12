import React from 'react';
import { render, screen } from '@testing-library/react';
import Dashboard from './Dashboard';

test('renders dashboard elements correctly', () => {
  const sampleData = {
    fitScore: {
      total: 75,
      matched: 50,
      partial: 15,
      missing: 35,
    },
    matchedSkills: ['JavaScript', 'React'],
    improvementSuggestions: ['Add proficiency in Python.'],
  };

  render(<Dashboard data={sampleData} />);

  // Check if the fit score renders
  expect(screen.getByText(/75% Match/)).toBeInTheDocument();

  // Check matched skills list
  expect(screen.getByText(/JavaScript/)).toBeInTheDocument();
  expect(screen.getByText(/React/)).toBeInTheDocument();

  // Check improvement suggestions
  expect(screen.getByText(/Add proficiency in Python/)).toBeInTheDocument();
});

test('renders adaptively with different data', () => {
  const sampleData = {
    fitScore: {
      total: 60,
      matched: 30,
      partial: 20,
      missing: 50,
    },
    matchedSkills: ['Python', 'Django'],
    improvementSuggestions: ['Include more projects.', 'Mention cloud experience.'],
  };

  render(<Dashboard data={sampleData} />);

  // Check updated fit score
  expect(screen.getByText(/60% Match/)).toBeInTheDocument();

  // Check matched skills list
  expect(screen.getByText(/Python/)).toBeInTheDocument();
  expect(screen.getByText(/Django/)).toBeInTheDocument();
});
