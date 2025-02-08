/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
"use client";

import { useParams, useRouter } from "next/navigation";
import * as React from "react";
import Box from "@mui/joy/Box";
import Card from "@mui/joy/Card";
import Typography from "@mui/joy/Typography";
import Button from "@mui/joy/Button";
import Alert from "@mui/joy/Alert";
import CircularProgress from "@mui/joy/CircularProgress";
import { request } from "@/app/lib/http/request";
import JSZip from "jszip";
import { API_URL } from '@/app/config/constants'


type GenericType<T=any> =T

export default function MediaCover() {
  const [alert, setAlert] = React.useState<{ error?: string }>({});
  const [videoStatus, setVideoStatus] = React.useState<GenericType>(null);
  const [images, setImages] = React.useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = React.useState<number>(0);
  const { videoId } = useParams();
  const router = useRouter();
  const videoStatusRef = React.useRef<GenericType>(null);

  // Função para buscar o status do vídeo
  const getVideoStatus = React.useCallback(async () => {
    if (!videoId) return;

    try {
      const [videoStatusResponse, videoStatusError] = await request({
        method: "GET",
        url: `${API_URL}/v1/api/video/status?videoId=${videoId}`,
        config: {
          headers: {
            Authorization: sessionStorage.getItem("accessToken"),
          },
        },
      });

      if (videoStatusError) {
        setAlert({ error: "Não foi possível localizar o status do vídeo." });
        return;
      }
      const { data } = videoStatusResponse as GenericType

      // Se a resposta for um array, pega o primeiro item
      const videoStatusData =
        Array.isArray(data) &&
        data.length > 0
          ? data[0]
          : data;

      // Atualiza o estado somente se os dados forem diferentes
      if (JSON.stringify(videoStatusRef.current) !== JSON.stringify(videoStatusData)) {
        videoStatusRef.current = videoStatusData;
        setVideoStatus(videoStatusData);
      }
    } catch (error) {
      console.error("Erro ao buscar status do vídeo:", error);
      setAlert({ error: "Erro ao buscar status do vídeo." });
    }
  }, [videoId]);

  // Busca inicial do status do vídeo
  React.useEffect(() => {
    getVideoStatus();
  }, [getVideoStatus]);

  // Enquanto o status for "pending", configura um polling a cada 3 segundos
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (videoStatus) {
      if (videoStatus.status === "pending") {
        interval = setInterval(() => {
          getVideoStatus();
        }, 3000);
      } else if (videoStatus.status === "error") {
        setAlert({ error: "Ocorreu um erro no processamento do vídeo." });
      }
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [videoStatus, getVideoStatus]);

  // Após o status deixar de ser "pending", faz o download e descompacta o arquivo ZIP de imagens
  // Após o status deixar de ser "pending", faz o download e descompacta o arquivo ZIP de imagens
  React.useEffect(() => {
    const fetchAndUnzipImages = async () => {
      if (videoStatus?.imagesUrl) {
        try {
          // Configurando o responseType para "blob" para receber o arquivo ZIP como blob
          const [imagesResponse, imagesError] = await request({
            method: "GET",
            url: videoStatus.imagesUrl,
            config: {
              responseType: "blob",
            },
          });
          if (imagesError) {
            throw new Error("Erro ao baixar o arquivo ZIP");
          }

          const { data } = imagesResponse as GenericType

          // Em uma resposta do axios com responseType "blob", o blob estará em imagesResponse.data
          const blob = data;
          const zip = await JSZip.loadAsync(blob);

          // Filtra os arquivos com o padrão frame-XXXX.png, ordena e cria URLs para cada imagem
          const filePromises = Object.values(zip.files)
            .filter((file) => file.name.match(/frame-\d+\.png$/))
            .sort((a, b) => a.name.localeCompare(b.name))
            .map(async (file) => {
              const fileBlob = await file.async("blob");
              return URL.createObjectURL(fileBlob);
            });

          const imageUrls = await Promise.all(filePromises);
          setImages(imageUrls);
          setCurrentIndex(0);
        } catch (error) {
          console.error("Erro ao descompactar imagens:", error);
          setAlert({ error: "Erro ao processar imagens do vídeo." });
        }
      }
    };

    // Se o status não for "pending", busca e descompacta as imagens.
    if (videoStatus && videoStatus.status === "finished") {
      fetchAndUnzipImages();
    }
  }, [videoStatus]);

  // Funções para o carousel
  const nextImage = () => {
    if (images.length) {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }
  };

  const prevImage = () => {
    if (images.length) {
      setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  // Se os dados ainda não foram carregados, exibe um loading inicial
  if (!videoStatus) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          gap: 2,
        }}
      >
        <CircularProgress size="lg" />
        <Typography level="body-md">Carregando dados do vídeo...</Typography>
      </Box>
    );
  }

  // Se o status do vídeo for "pending", exibe uma tela de loading especial
  if (videoStatus.status === "pending") {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          gap: 2,
          backgroundColor: "background.level1",
          padding: 4,
        }}
      >
        <CircularProgress size="lg" />
        <Typography level="body-md">
          O vídeo ainda está sendo processado. Por favor, aguarde...
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
        padding: 4,
      }}
    >
      {/* Exibe alerta de erro, se houver */}
      {alert.error && (
        <Alert
          color="danger"
          variant="soft"
          sx={{ width: "100%", maxWidth: 400 }}
        >
          {alert.error}
        </Alert>
      )}

      {/* Informações do Vídeo */}
      <Card sx={{ width: 400, padding: 2, textAlign: "center" }}>
        <Typography level="title-md">
          {videoStatus.videoData?.name || "Nome do Vídeo"}
        </Typography>
        <Typography level="body-sm" sx={{ marginBottom: 1 }}>
          {videoStatus.videoData?.description || "Descrição do vídeo"}
        </Typography>
        <Typography level="body-sm" color="neutral">
          Video ID: {videoId}
        </Typography>
        <Typography level="body-sm" color="neutral">
          Status: {videoStatus.status || "Status não informado"}
        </Typography>
      </Card>

      {/* Conteúdo (Player e Carousel de Imagens) */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "flex-start",
          justifyContent: "center",
          gap: 4,
          padding: 4,
        }}
      >
        {/* Player de Vídeo */}
        <Card sx={{ width: 400, heigth: 380, padding: 2, textAlign: "center" }}>
          <video controls width="100%" poster={images[0]}>
            <source src={videoStatus.videoUrl} type="video/mp4" />
          </video>
          <Box sx={{ textAlign: "center", marginTop: 2 }}>
            <Button
              component="a"
              href={videoStatus.videoUrl}
              download
              color="primary"
            >
              Baixar Vídeo
            </Button>
          </Box>
        </Card>

        {/* Carousel de Imagens Extraídas do ZIP */}
        <Card sx={{ width: 400, padding: 2, textAlign: "center" }}>
          {images.length > 0 ? (
            <Box>
              <img
                src={images[currentIndex]}
                alt={`Frame ${currentIndex + 1}`}
                width="100%"
                style={{ maxHeight: 300, objectFit: "contain" }}
              />
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mt: 1,
                }}
              >
                <Button onClick={prevImage} variant="outlined">
                  Anterior
                </Button>
                <Typography level="body-sm">
                  {currentIndex + 1} / {images.length}
                </Typography>
                <Button onClick={nextImage} variant="outlined">
                  Próximo
                </Button>
              </Box>
            </Box>
          ) : (
            <Typography>{!alert.error ? 'Renderizando imagens...' : 'Ocorreu um erro ao renderizar as imagens'}</Typography>
          )}
          <Box sx={{ textAlign: "center", marginTop: 2 }}>
            <Button
              // disable={`${Object.keys(alert).length > 0}`}
              component="a"
              href={videoStatus.imagesUrl}
              download
              color="primary"
            >
              Baixar ZIP de Imagens
            </Button>
          </Box>
        </Card>
      </Box>

      {/* Botão para voltar para a página de upload de vídeo */}
      <Button
        variant="outlined"
        color="neutral"
        onClick={() => router.push("/home")}
      >
        Voltar para Upload
      </Button>
    </Box>
  );
}
