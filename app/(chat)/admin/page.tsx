"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";

interface User {
  id: string;
  email: string;
  isApproved: boolean;
  approvedAt?: string;
  role: string;
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Redirect if not admin
  if (status === "loading") return <div>Loading...</div>;
  if (!session?.user || session.user.role !== "admin") {
    redirect("/");
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const [allUsersRes, pendingUsersRes] = await Promise.all([
        fetch("/api/admin/users"),
        fetch("/api/admin/users?type=pending"),
      ]);

      const allUsersData = await allUsersRes.json();
      const pendingUsersData = await pendingUsersRes.json();

      setUsers(allUsersData.users);
      setPendingUsers(pendingUsersData.users);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const handleUserAction = async (action: string, userId: string, role?: string) => {
    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, userId, role }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message);
        await fetchUsers(); // Refresh the lists
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      console.error("Error managing user:", error);
      toast.error("Failed to manage user");
    }
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Badge variant="secondary">Admin: {session?.user?.email}</Badge>
      </div>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">
            Pending Approval ({pendingUsers.length})
          </TabsTrigger>
          <TabsTrigger value="all">All Users ({users.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Users Pending Approval</CardTitle>
            </CardHeader>
            <CardContent>
              {pendingUsers.length === 0 ? (
                <p className="text-muted-foreground">No users pending approval</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{user.role}</Badge>
                        </TableCell>
                        <TableCell className="space-x-2">
                          <Button
                            size="sm"
                            onClick={() => handleUserAction("approve", user.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleUserAction("reject", user.id)}
                          >
                            Reject
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>All Users</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Approved Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge
                          variant={user.isApproved ? "default" : "secondary"}
                        >
                          {user.isApproved ? "Approved" : "Pending"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{user.role}</Badge>
                      </TableCell>
                      <TableCell>
                        {user.approvedAt
                          ? new Date(user.approvedAt).toLocaleDateString()
                          : "-"}
                      </TableCell>
                      <TableCell className="space-x-2">
                        {user.role === "user" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleUserAction("setRole", user.id, "admin")
                            }
                          >
                            Make Admin
                          </Button>
                        )}
                        {user.role === "admin" && user.id !== session?.user?.id && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleUserAction("setRole", user.id, "user")
                            }
                          >
                            Remove Admin
                          </Button>
                        )}
                        {user.id !== session?.user?.id && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleUserAction("reject", user.id)}
                          >
                            Delete
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}