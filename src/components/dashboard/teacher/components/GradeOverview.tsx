import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { GradeResponse, GRADE_OPTIONS } from '@/services/api/gradeApi';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface Props {
  grades: GradeResponse[];
}

export const GradeOverview: React.FC<Props> = ({ grades }) => {
  const subjectWiseGrades = useMemo(() => {
    const gradesBySubject = new Map<string, Map<string, number>>();
    
    grades.forEach(grade => {
      if (!gradesBySubject.has(grade.subject)) {
        gradesBySubject.set(grade.subject, new Map());
      }
      const subjectGrades = gradesBySubject.get(grade.subject)!;
      subjectGrades.set(grade.grade, (subjectGrades.get(grade.grade) || 0) + 1);
    });
    
    return gradesBySubject;
  }, [grades]);

  // Prepare data for the chart
  const data = {
    labels: Object.keys(GRADE_OPTIONS),
    datasets: [
      {
        label: 'Number of Students',
        data: Object.keys(GRADE_OPTIONS).map(grade => 
          grades.filter(g => g.grade === grade).length
        ),
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Grade Distribution',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Class Performance Overview</h3>
        <div style={{ height: '400px' }}>
          <Bar data={data} options={options} />
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Subject-wise Distribution</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from(new Set(grades.map(g => g.subject))).map(subject => (
            <div key={subject} className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">{subject}</h4>
              <div className="space-y-2">
                {Object.keys(GRADE_OPTIONS).map(grade => {
                  const count = grades.filter(g => g.subject === subject && g.grade === grade).length;
                  return count > 0 ? (
                    <div key={grade} className="flex justify-between items-center">
                      <span className="text-sm font-medium">{grade}</span>
                      <span className="text-sm text-gray-600">{count} students</span>
                    </div>
                  ) : null;
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
