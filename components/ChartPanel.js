import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const defaultOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: "bottom",
      labels: {
        color: "#EAEAEA",
      },
    },
    title: {
      display: false,
    },
  },
  scales: {
    x: {
      ticks: { color: "#EAEAEA" },
      grid: { color: "rgba(234,234,234,0.08)" },
    },
    y: {
      ticks: { color: "#EAEAEA" },
      grid: { color: "rgba(234,234,234,0.08)" },
    },
  },
};

export default function ChartPanel({ data, options }) {
  return (
    <div className="bg-[#1A1A1A] rounded-2xl shadow-lg p-6">
      <Line data={data} options={{ ...defaultOptions, ...options }} />
    </div>
  );
}

