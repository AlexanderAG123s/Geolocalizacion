import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EmergencyMap } from "@/components/dashboard/emergency-map"
import { EmergencyList } from "@/components/dashboard/emergency-list"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { ActivityChart } from "@/components/dashboard/activity-chart"
import { UsersList } from "@/components/dashboard/users-list"

export default function DashboardPage() {
  return (
    <div className="container mx-auto py-8 space-y-6">
      <h1 className="text-3xl font-bold">Panel de Control de Emergencias</h1>

      <StatsCards />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Mapa de Emergencias</CardTitle>
          </CardHeader>
          <CardContent className="h-[400px]">
            <EmergencyMap />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Emergencias Activas</CardTitle>
          </CardHeader>
          <CardContent>
            <EmergencyList />
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="emergencies">Emergencias</TabsTrigger>
          <TabsTrigger value="users">Usuarios</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Actividad General</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ActivityChart />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="emergencies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Emergencias Recientes</CardTitle>
            </CardHeader>
            <CardContent>
              <EmergencyList showAll />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Usuarios Conectados</CardTitle>
            </CardHeader>
            <CardContent>
              <UsersList />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
