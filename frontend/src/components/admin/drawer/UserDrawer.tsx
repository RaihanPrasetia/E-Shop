import { useState, useEffect } from "react";
import {
    Drawer,
    Box,
    Typography,
    TextField,
    Button,
    Stack,
    CircularProgress,
    IconButton,
    MenuItem
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useForm, Controller } from "react-hook-form";
import { useNotification } from "@/hooks/useNotification";
import userService from "@/services/user/userService";
import AvatarUpload from "../AvatarUpload";
import { FormattedUserType, UserRequest } from "@/utils/types/UserType";

interface UserDrawerProps {
    open: boolean;
    onClose: () => void;
    editMode: boolean;
    user: FormattedUserType | null;
    onSuccess: () => void;
}

export const UserDrawer: React.FC<UserDrawerProps> = ({
    open,
    onClose,
    editMode,
    user,
    onSuccess
}) => {
    const [submitting, setSubmitting] = useState(false);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const { showNotification } = useNotification();

    const { control, handleSubmit, reset, formState: { errors }, setValue } = useForm<UserRequest>({
        defaultValues: {
            name: "",
            username: "",
            email: "",
            password: "",
            avatar: "",
            role: "user",
        }
    });

    useEffect(() => {
        if (open) {
            if (editMode && user) {
                reset({
                    name: user.name,
                    username: user.username,
                    email: user.email,
                    avatar: user.avatar ? user.avatar : '',
                    role: user.role,
                    // Password empty for security
                });
            } else {
                reset({
                    name: "",
                    username: "",
                    email: "",
                    password: "",
                    avatar: "",
                    role: "user",
                });
                setAvatarFile(null);
            }
        }
    }, [open, editMode, user, reset]);

    const handleAvatarSelect = (file: File) => {
        setAvatarFile(file);
        // Clear the avatar URL field since we'll be using the file instead
        setValue("avatar", "");
    };

    const onSubmit = async (data: UserRequest) => {
        try {
            setSubmitting(true);

            let response;
            if (editMode && user) {
                // For update, pass the avatarFile to the service
                response = await userService.updateUser(user.id, data, avatarFile);
                showNotification("User berhasil diperbarui", "success");
            } else {
                // Pass the avatarFile as second parameter
                response = await userService.createUser(data, avatarFile);

                if (response.status === 500) {
                    showNotification(response.message ?? "User gagal dibuat", "error");
                } else if (response.status === 201) {
                    showNotification("User berhasil dibuat", "success");
                } else {
                    showNotification("Terjadi kesalahan saat membuat user", "error");
                }
            }

            onSuccess();
            onClose(); // Close drawer after success
        } catch (error: any) {
            showNotification(error instanceof Error ? error.message : "Failed to save user", "error");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: { width: { xs: '100%', sm: 400 } }
            }}
        >
            <Box sx={{ p: 3 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h6">
                        {editMode ? "Edit User" : "Add New User"}
                    </Typography>
                    <IconButton onClick={onClose} edge="end">
                        <CloseIcon />
                    </IconButton>
                </Box>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <Stack spacing={3}>
                        {/* Avatar Upload Component */}
                        <Box>
                            <Typography variant="body2" mb={1}>
                                Avatar (100KB - 500KB)
                            </Typography>
                            <AvatarUpload
                                onFileSelect={handleAvatarSelect}
                                initialAvatarUrl={editMode && user ? `${import.meta.env.VITE_API_URL}/storage/${user.avatar}` : null}
                            />
                        </Box>

                        <Controller
                            name="name"
                            control={control}
                            rules={{ required: "Name is required" }}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="Name"
                                    variant="outlined"
                                    fullWidth
                                    error={!!errors.name}
                                    helperText={errors.name?.message}
                                    disabled={submitting}
                                />
                            )}
                        />

                        <Controller
                            name="username"
                            control={control}
                            rules={{ required: "Username is required" }}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="Username"
                                    variant="outlined"
                                    fullWidth
                                    error={!!errors.username}
                                    helperText={errors.username?.message}
                                    disabled={submitting}
                                />
                            )}
                        />

                        <Controller
                            name="email"
                            control={control}
                            rules={{
                                required: "Email is required",
                                pattern: {
                                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                    message: "Invalid email address"
                                }
                            }}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="Email"
                                    variant="outlined"
                                    fullWidth
                                    error={!!errors.email}
                                    helperText={errors.email?.message}
                                    disabled={submitting}
                                />
                            )}
                        />

                        {!editMode && (
                            <Controller
                                name="password"
                                control={control}
                                rules={{ required: "Password is required" }}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Password"
                                        type="password"
                                        variant="outlined"
                                        fullWidth
                                        error={!!errors.password}
                                        helperText={errors.password?.message}
                                        disabled={submitting}
                                    />
                                )}
                            />
                        )}

                        <Controller
                            name="role"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    select
                                    label="Role"
                                    variant="outlined"
                                    fullWidth
                                    disabled={submitting}
                                >
                                    <MenuItem value="customer">Customer</MenuItem>
                                    <MenuItem value="management">Management</MenuItem>
                                </TextField>
                            )}
                        />

                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                            <Button
                                variant="outlined"
                                onClick={onClose}
                                disabled={submitting}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="contained"
                                className="bg-utama"
                                disabled={submitting}
                                startIcon={submitting ? <CircularProgress size={20} /> : null}
                            >
                                {submitting ? 'Saving...' : editMode ? 'Update' : 'Create'}
                            </Button>
                        </Box>
                    </Stack>
                </form>
            </Box>
        </Drawer>
    );
};