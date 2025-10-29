import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const defaultOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: "bottom",
      labels: { color: "#EAEAEA" },
    },
  },
};

export default function DonutPanel({ data, options }) {
  return (
    <div className="bg-[#1A1A1A] rounded-2xl shadow-lg p-6">
      <Doughnut data={data} options={{ ...defaultOptions, ...options }} />
    </div>
  );
}

