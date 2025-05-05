"use client"

import { useEffect, useRef, useState } from "react"
import { useSocketStore } from "@/lib/socket-service"

interface ActivityChartProps {
  type?: "alerts" | "users"
}

export function ActivityChart({ type = "alerts" }: ActivityChartProps) {
  const { alerts } = useSocketStore()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [chartData, setChartData] = useState<{
    labels: string[]
    datasets: {
      label: string
      data: number[]
      backgroundColor: string
      borderColor: string
    }[]
  }>({
    labels: [],
    datasets: [],
  })

  // Preparar datos para el gráfico
  useEffect(() => {
    if (type === "alerts") {
      // Agrupar alertas por hora
      const last24Hours = new Array(24).fill(0).map((_, i) => {
        const date = new Date()
        date.setHours(date.getHours() - 23 + i)
        return date.getHours()
      })

      const alertsByHour = new Array(24).fill(0)

      alerts.forEach((alert) => {
        const alertDate = new Date(alert.timestamp)
        const hourIndex = last24Hours.indexOf(alertDate.getHours())
        if (hourIndex !== -1) {
          alertsByHour[hourIndex]++
        }
      })

      setChartData({
        labels: last24Hours.map((hour) => `${hour}:00`),
        datasets: [
          {
            label: "Alertas",
            data: alertsByHour,
            backgroundColor: "rgba(217, 83, 79, 0.2)",
            borderColor: "rgba(217, 83, 79, 1)",
          },
        ],
      })
    } else {
      // Datos de ejemplo para actividad de usuarios
      setChartData({
        labels: ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"],
        datasets: [
          {
            label: "Usuarios Activos",
            data: [12, 19, 15, 17, 14, 8, 10],
            backgroundColor: "rgba(66, 133, 244, 0.2)",
            borderColor: "rgba(66, 133, 244, 1)",
          },
        ],
      })
    }
  }, [alerts, type])

  // Renderizar gráfico
  useEffect(() => {
    if (!canvasRef.current || !chartData.labels.length) return

    // Importar Chart.js dinámicamente
    import("chart.js/auto").then((ChartModule) => {
      const Chart = ChartModule.default

      // Destruir gráfico existente si hay uno
      const chartInstance = Chart.getChart(canvasRef.current)
      if (chartInstance) {
        chartInstance.destroy()
      }

      // Crear nuevo gráfico
      new Chart(canvasRef.current, {
        type: "line",
        data: chartData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              position: "top",
            },
            tooltip: {
              mode: "index",
              intersect: false,
            },
          },
          scales: {
            x: {
              grid: {
                display: false,
              },
            },
            y: {
              beginAtZero: true,
              ticks: {
                precision: 0,
              },
            },
          },
        },
      })
    })
  }, [chartData])

  return (
    <div className="h-full w-full">
      <canvas ref={canvasRef} />
    </div>
  )
}
