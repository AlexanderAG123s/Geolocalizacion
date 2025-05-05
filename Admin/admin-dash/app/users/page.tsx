import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UsersList } from "@/components/dashboard/users-list"

export default function UsersPage() {
  return (
    <div className="container mx-auto py-8 space-y-6">
      <h1 className="text-3xl font-bold">Usuarios Activos</h1>

      <p className="text-muted-foreground">Monitorea los usuarios conectados al sistema y su estado actual.</p>

      <Card>
        <CardHeader>
          <CardTitle>Todos los Usuarios</CardTitle>
        </CardHeader>
        <CardContent>
          <UsersList />
        </CardContent>
      </Card>
    </div>
  )
}
