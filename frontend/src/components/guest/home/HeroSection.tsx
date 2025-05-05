import { Box, Button, Container, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function HeroSection() {
    const navigate = useNavigate()

    const handleRegister = () => {
        navigate('/register')
    }
    return (
        <Box
            sx={{
                height: "100vh",
                display: "flex",
                alignItems: "center",
                backgroundImage: "url('/img/bg-hero.jpg')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                position: "relative",
            }}
        >
            <Box
                sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: "rgba(0, 0, 0, 0.6)", // Transparansi gelap
                    zIndex: 0, // Agar overlay di atas gambar
                }}
            />
            <Container sx={{ position: "relative", zIndex: 2, mt: -10 }}>
                <Typography variant="h2" color="white" fontWeight="bold" gutterBottom>
                    Temukan Produk Impianmu
                </Typography>
                <Typography variant="h6" color="white" mb={4}>
                    Belanja mudah, cepat, dan terpercaya di toko kami.
                </Typography>
                <Button
                    variant="contained"
                    className="bg-utama text-white "
                    size="large"
                    onClick={handleRegister}
                >
                    Belanja Sekarang
                </Button>
            </Container>
        </Box>
    )
}
