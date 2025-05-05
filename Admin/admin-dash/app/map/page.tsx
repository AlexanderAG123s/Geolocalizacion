import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EmergencyMap } from "@/components/dashboard/emergency-map"

export default function MapPage() {
  return (
    <div className="container mx-auto py-8 space-y-6">
      <h1 className="text-3xl font-bold">Mapa de Emergencias</h1>

      <p className="text-muted-foreground">
        Visualiza en tiempo real la ubicación de todas las alertas de emergencia activas.
      </p>

      <Card>
        <CardHeader>
          <CardTitle>Mapa en Tiempo Real</CardTitle>
        </CardHeader>
        <CardContent className="h-[600px]">
          <EmergencyMap />
        </CardContent>
      </Card>
    </div>
  )
}
