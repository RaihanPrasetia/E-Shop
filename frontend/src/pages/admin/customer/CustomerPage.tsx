import { useCallback, useEffect, useState } from "react";
import Content from "@/components/ui/content/Content";
import ContentBody from "@/components/ui/content/ContentBody";
import { ContentHead } from "@/components/ui/content/ContentHead";

import { Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import userService from "@/services/user/userService";
import { useNotification } from "@/hooks/useNotification";
import { FormattedUserType } from "@/utils/types/UserType";
import { UserList } from "@/components/admin/table/UserList";
import { UserDrawer } from "@/components/admin/drawer/UserDrawer";

export default function CustomerPage() {
    const [users, setCategories] = useState<FormattedUserType[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
    const [editMode, setEditMode] = useState<boolean>(false);
    const [selectedUser, setSelectedUser] = useState<FormattedUserType | null>(null);
    const { showNotification } = useNotification(); // Use the notification hook


    const fetchCategories = useCallback(async () => {
        try {
            setLoading(true);
            const response = await userService.getUsers();
            setCategories(response.usersFormatted);
        } catch (error) {
            if (error instanceof Error) {
                showNotification(error.message, "error");
            } else {
                showNotification("Failed to fetch users", "error");
            }
        } finally {
            setLoading(false);
        }
    }, []); // Kosongkan dependency array

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const handleOpenDrawer = (mode: "add" | "edit", user?: FormattedUserType) => {
        if (mode === "edit" && user) {
            setSelectedUser(user);
            setEditMode(true);
        } else {
            setSelectedUser(null);
            setEditMode(false);
        }
        setDrawerOpen(true);
    };

    const handleCloseDrawer = () => {
        setDrawerOpen(false);
        setSelectedUser(null);
    };

    const handleDeleteUser = async (id: string) => {
        try {
            await userService.deleteUser(id);
            showNotification("Kategori berhasil dihapus", "success");
            fetchCategories();
        } catch (error) {
            showNotification(error instanceof Error ? error.message : "Failed to delete user", "error");
        }
    };

    return (
        <Content>
            <ContentHead title="List User" subTitle="Manage your user here">
                <Button
                    className="bg-utama"
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDrawer("add")}
                >
                    Add User
                </Button>
            </ContentHead>
            <ContentBody>
                <UserList
                    users={users}
                    loading={loading}
                    onEdit={(user) => handleOpenDrawer("edit", user)}
                    onDelete={handleDeleteUser}
                />
            </ContentBody>

            <UserDrawer
                open={drawerOpen}
                onClose={handleCloseDrawer}
                editMode={editMode}
                user={selectedUser}
                onSuccess={() => {
                    handleCloseDrawer();
                    fetchCategories();
                }}
            />
        </Content>
    );
}
