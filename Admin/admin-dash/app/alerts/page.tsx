import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EmergencyList } from "@/components/dashboard/emergency-list"

export default function AlertsPage() {
  return (
    <div className="container mx-auto py-8 space-y-6">
      <h1 className="text-3xl font-bold">Historial de Alertas</h1>

      <p className="text-muted-foreground">
        Visualiza y gestiona todas las alertas de emergencia recibidas desde la aplicación móvil.
      </p>

      <Card>
        <CardHeader>
          <CardTitle>Todas las Alertas</CardTitle>
        </CardHeader>
        <CardContent>
          <EmergencyList showAll />
        </CardContent>
      </Card>
    </div>
  )
}
