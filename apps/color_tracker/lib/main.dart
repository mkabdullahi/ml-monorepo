import 'package:flutter/material.dart';
import 'dart:async';
import 'dart:convert';
import 'dart:typed_data';
import 'package:web_socket_channel/web_socket_channel.dart';
import 'package:http/http.dart' as http;

void main() {
  runApp(const MainApp());
}

class MainApp extends StatelessWidget {
  const MainApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Color Tracking Dashboard',
      theme: ThemeData(primarySwatch: Colors.blue),
      home: const ColorTrackingScreen(),
    );
  }
}

class ColorTrackingScreen extends StatefulWidget {
  const ColorTrackingScreen({super.key});

  @override
  State<ColorTrackingScreen> createState() => _ColorTrackingScreenState();
}

class _ColorTrackingScreenState extends State<ColorTrackingScreen> {
  late WebSocketChannel _channel;
  Uint8List? _currentFrame;
  Map<String, int> _stats = {};
  String _narration = '';
  bool _isRunning = false;
  String _error = '';
  final String _baseUrl =
      'http://192.168.64.4:8000'; // Change to the real IP for mobile to work
  final String _wsUrl =
      'ws://192.168.64.4:8000/ws/video'; // Change to the real IP for mobile to work

  @override
  void initState() {
    super.initState();
    _connectWebSocket();
  }

  void _connectWebSocket() {
    _channel = WebSocketChannel.connect(Uri.parse(_wsUrl));

    _channel.stream.listen(
      (message) {
        final data = json.decode(message as String);

        if (data['type'] == 'frame') {
          setState(() {
            _currentFrame = base64Decode(data['data']);
            _stats = Map<String, int>.from(data['stats']);
            _narration = data['narration'] ?? '';
            _error = '';
          });
        } else if (data['type'] == 'status') {
          setState(() => _error = data['message']);
        } else if (data['type'] == 'error') {
          setState(() => _error = data['message']);
        }
      },
      onError: (error) {
        setState(() => _error = 'WebSocket error: $error');
      },
      onDone: () {
        setState(() => _error = 'WebSocket closed. Reconnecting...');
        Future.delayed(const Duration(seconds: 2), _connectWebSocket);
      },
    );
  }

  Future<void> _toggleTracking(bool start) async {
    final endpoint = start ? '/api/start' : '/api/stop';
    final response = await http.post(Uri.parse('$_baseUrl$endpoint'));

    if (response.statusCode == 200) {
      setState(() => _isRunning = start);
    } else {
      setState(
        () => _error =
            'Failed to ${start ? 'start' : 'stop'} tracking: ${response.body}',
      );
    }
  }

  @override
  void dispose() {
    _channel.sink.close();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Color Tracking Dashboard'),
        actions: [
          IconButton(
            icon: Icon(_isRunning ? Icons.stop : Icons.play_arrow),
            onPressed: () => _toggleTracking(!_isRunning),
            tooltip: _isRunning ? 'Stop Tracking' : 'Start Tracking',
          ),
        ],
      ),
      body: Column(
        children: [
          Expanded(
            flex: 3,
            child: _currentFrame != null
                ? Image.memory(
                    _currentFrame!,
                    fit: BoxFit.contain,
                    gaplessPlayback: true,
                  )
                : Center(
                    child: Text(
                      _error.isNotEmpty
                          ? _error
                          : 'Connecting to video feed...',
                    ),
                  ),
          ),
          Expanded(
            flex: 2,
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Detection Stats:',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 8),
                  ..._stats.entries.map(
                    (e) => Text(
                      '${e.key}: ${e.value} objects',
                      style: const TextStyle(fontSize: 16),
                    ),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'LLM Narration:',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    _narration.isNotEmpty ? _narration : 'No narration yet...',
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
