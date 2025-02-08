"use client"

import React, { useState } from 'react';
import { Button, CircularProgress, Box, Container, Typography, Alert } from '@mui/material';
import { request } from "@/app/lib/http/request";
import { useRouter } from "next/navigation";

type User = {
  email: string
  displayName: string
  image: string
  userId: string
}

type GenericType<T=any> = T

const VideoUpload = ({ user }: { user: User }) => {
  const router = useRouter();
  const [file, setFile] = useState<GenericType>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (event: GenericType) => {
    setFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', file.name);
    formData.append('userId', user.userId);
    setLoading(true);

    try {
    const [videoResponse, videoError] = await request({
        method: "POST",
        url: `${process.env.BASE_URL}/v1/api/video/upload`,
        data: formData,
        config: {
            headers: {
                'Authorization': sessionStorage.getItem('accessToken')
            }
        }
      });

      if (videoError) {
        console.error(videoError);
        setError("Erro ao fazer upload do video");
        return;
      }

      if (videoResponse && videoResponse.status === 201) {
        console.log(videoResponse)
        const { data } = videoResponse as GenericType
        router.push(`/images/${data.videoId}`)
      }
    } catch (error) {
        setError('Erro ao fazer upload do vídeo.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container fixed>
      <Box 
        display="flex" 
        flexDirection="column" 
        alignItems="center" 
        justifyContent="center" 
        minHeight="100vh"
        textAlign="center"
      >
        <Typography variant="h5" gutterBottom>
          Faça upload do seu vídeo
        </Typography>
        <input
          type="file"
          accept="video/*"
          onChange={handleFileChange}
          style={{ display: 'none' }}
          id="upload-button"
        />
        <label htmlFor="upload-button">
          <Button variant="contained" component="span">
            Selecionar Vídeo
          </Button>
        </label>
        <Button
          variant="contained"
          color="primary"
          onClick={handleUpload}
          disabled={!file || loading}
          style={{ marginTop: '16px' }}
        >
          {loading ? <CircularProgress size={24} /> : 'Enviar Vídeo'}
        </Button>
        <Typography variant="subtitle1" gutterBottom>
         {file ? file.name : ''}
        </Typography>
        { error && !loading && <Alert severity="error">{error}</Alert> }
      </Box>
    </Container>
  );
};

export default VideoUpload;
