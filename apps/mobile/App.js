import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useState, useRef, useEffect } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function App() {
  const [facing, setFacing] = useState('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [isConnected, setIsConnected] = useState(false);
  const [ws, setWs] = useState(null);
  const cameraRef = useRef(null);

  useEffect(() => {
    // Replace with your local machine's IP address.
    // 'localhost' won't work on a physical device.
    const wsUrl = 'ws://localhost:8000/ws'; 
    
    let websocket;
    try {
        websocket = new WebSocket(wsUrl);
        websocket.onopen = () => {
        console.log('Connected to backend');
        setIsConnected(true);
        };
        websocket.onclose = () => {
        console.log('Disconnected');
        setIsConnected(false);
        };
        websocket.onerror = (e) => {
        console.log('Error:', e.message);
        };
        setWs(websocket);
    } catch (e) {
        console.log('WS Error: ', e);
    }

    return () => {
      if(websocket) websocket.close();
    };
  }, []);

  if (!permission) {
    // Camera permissions are still loading
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet
    return (
      <View style={styles.container}>
        <Text style={{textAlign: 'center', marginBottom: 20}}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }

  return (
    <LinearGradient
        // Background gradient matching .app-container
        colors={['#667eea', '#764ba2']}
        style={styles.container}
    >
      {/* Header matching .app-header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🎨 Color Tracker Dashboard</Text>
        <Text style={styles.headerSubtitle}>Real-time RGB Detection</Text>
      </View>

      <View style={styles.cameraContainer}>
        <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
            <View style={styles.statusOverlay}>
                <Text style={styles.statusText}>
                    Status: {isConnected ? '🟢 Online' : '🔴 Offline'}
                </Text>
            </View>
            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
                    <Text style={styles.text}>Flip Camera</Text>
                </TouchableOpacity>
            </View>
        </CameraView>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60, // Safe area padding roughly
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333', // fallback
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  cameraContainer: {
    flex: 1,
    padding: 20,
  },
  camera: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    margin: 32,
  },
  button: {
    flex: 1,
    alignSelf: 'flex-end',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: -1, height: 1},
    textShadowRadius: 10
  },
  statusOverlay: {
    position: 'absolute',
    top: 20,
    left: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 8,
    borderRadius: 8,
  },
  statusText: {
    color: 'white',
    fontWeight: 'bold',
  }
});
