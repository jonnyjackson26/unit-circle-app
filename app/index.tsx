import React, { useState, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  PanResponder,
  Platform,
} from 'react-native';
import Svg, {
  Circle,
  Line,
  Path,
  Text as SvgText,
  G,
} from 'react-native-svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const CIRCLE_SIZE = Math.min(screenWidth, screenHeight - 300) * 0.8;
const RADIUS = CIRCLE_SIZE / 2;
const CENTER_X = CIRCLE_SIZE / 2;
const CENTER_Y = CIRCLE_SIZE / 2;

const COMMON_ANGLES = [0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330];
const SNAP_THRESHOLD = 8;

export default function UnitCircleApp() {
  const [angle, setAngle] = useState(45);
  
  const angleRad = useMemo(() => (angle * Math.PI) / 180, [angle]);
  const cosValue = useMemo(() => Math.cos(angleRad), [angleRad]);
  const sinValue = useMemo(() => Math.sin(angleRad), [angleRad]);
  const tanValue = useMemo(() => Math.tan(angleRad), [angleRad]);
  
  const pointX = CENTER_X + RADIUS * cosValue;
  const pointY = CENTER_Y - RADIUS * sinValue;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        handleTouch(evt.nativeEvent.locationX, evt.nativeEvent.locationY);
      },
      onPanResponderMove: (evt) => {
        handleTouch(evt.nativeEvent.locationX, evt.nativeEvent.locationY);
      },
    })
  ).current;

  const handleTouch = (touchX: number, touchY: number) => {
    const dx = touchX - CENTER_X;
    const dy = CENTER_Y - touchY;
    let newAngle = Math.atan2(dy, dx) * (180 / Math.PI);
    
    if (newAngle < 0) newAngle += 360;
    
    for (const commonAngle of COMMON_ANGLES) {
      if (Math.abs(newAngle - commonAngle) < SNAP_THRESHOLD) {
        newAngle = commonAngle;
        break;
      }
    }
    
    setAngle(Math.round(newAngle));
  };

  const createArcPath = () => {
    const endX = CENTER_X + (RADIUS * 0.3) * Math.cos(angleRad);
    const endY = CENTER_Y - (RADIUS * 0.3) * Math.sin(angleRad);
    const largeArcFlag = angle > 180 ? 1 : 0;
    
    return `M ${CENTER_X + RADIUS * 0.3} ${CENTER_Y} A ${RADIUS * 0.3} ${RADIUS * 0.3} 0 ${largeArcFlag} 0 ${endX} ${endY}`;
  };

  const formatNumber = (num: number) => {
    if (Math.abs(num) < 0.0001) return '0';
    if (Math.abs(num - 1) < 0.0001) return '1';
    if (Math.abs(num + 1) < 0.0001) return '-1';
    if (Math.abs(num - 0.5) < 0.0001) return '½';
    if (Math.abs(num + 0.5) < 0.0001) return '-½';
    if (Math.abs(num - Math.sqrt(2)/2) < 0.0001) return '√2/2';
    if (Math.abs(num + Math.sqrt(2)/2) < 0.0001) return '-√2/2';
    if (Math.abs(num - Math.sqrt(3)/2) < 0.0001) return '√3/2';
    if (Math.abs(num + Math.sqrt(3)/2) < 0.0001) return '-√3/2';
    return num.toFixed(3);
  };

  const formatAngleRad = () => {
    const commonRadians: { [key: number]: string } = {
      0: '0',
      30: 'π/6',
      45: 'π/4',
      60: 'π/3',
      90: 'π/2',
      120: '2π/3',
      135: '3π/4',
      150: '5π/6',
      180: 'π',
      210: '7π/6',
      225: '5π/4',
      240: '4π/3',
      270: '3π/2',
      300: '5π/3',
      315: '7π/4',
      330: '11π/6',
      360: '2π',
    };
    
    return commonRadians[angle] || `${(angleRad).toFixed(3)} rad`;
  };

  const formatTan = () => {
    if (angle === 90 || angle === 270) return 'undefined';
    if (Math.abs(tanValue) > 100) return tanValue > 0 ? '∞' : '-∞';
    return formatNumber(tanValue);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#f0f4ff', '#e8efff']}
        style={StyleSheet.absoluteFillObject}
      />
      
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.title}>Interactive Unit Circle</Text>
          <Text style={styles.subtitle}>Drag the point to explore trigonometric values</Text>
        </View>

        <View style={styles.svgContainer} {...panResponder.panHandlers}>
          <Svg width={CIRCLE_SIZE} height={CIRCLE_SIZE}>
            {/* Grid lines */}
            {[-1, -0.5, 0.5, 1].map((val) => (
              <G key={`grid-${val}`}>
                <Line
                  x1={CENTER_X + RADIUS * val}
                  y1={0}
                  x2={CENTER_X + RADIUS * val}
                  y2={CIRCLE_SIZE}
                  stroke="#e0e0e0"
                  strokeWidth="1"
                />
                <Line
                  x1={0}
                  y1={CENTER_Y - RADIUS * val}
                  x2={CIRCLE_SIZE}
                  y2={CENTER_Y - RADIUS * val}
                  stroke="#e0e0e0"
                  strokeWidth="1"
                />
              </G>
            ))}

            {/* Axes */}
            <Line
              x1={0}
              y1={CENTER_Y}
              x2={CIRCLE_SIZE}
              y2={CENTER_Y}
              stroke="#666"
              strokeWidth="2"
            />
            <Line
              x1={CENTER_X}
              y1={0}
              x2={CENTER_X}
              y2={CIRCLE_SIZE}
              stroke="#666"
              strokeWidth="2"
            />

            {/* Unit circle */}
            <Circle
              cx={CENTER_X}
              cy={CENTER_Y}
              r={RADIUS}
              stroke="#2563eb"
              strokeWidth="3"
              fill="none"
            />

            {/* Common angle markers */}
            {COMMON_ANGLES.map((commonAngle) => {
              const rad = (commonAngle * Math.PI) / 180;
              const x = CENTER_X + RADIUS * Math.cos(rad);
              const y = CENTER_Y - RADIUS * Math.sin(rad);
              return (
                <Circle
                  key={commonAngle}
                  cx={x}
                  cy={y}
                  r="3"
                  fill="#94a3b8"
                />
              );
            })}

            {/* Angle arc */}
            <Path
              d={createArcPath()}
              stroke="#f97316"
              strokeWidth="2"
              fill="none"
            />

            {/* Radius line */}
            <Line
              x1={CENTER_X}
              y1={CENTER_Y}
              x2={pointX}
              y2={pointY}
              stroke="#f97316"
              strokeWidth="3"
            />

            {/* Cosine projection */}
            <Line
              x1={pointX}
              y1={pointY}
              x2={pointX}
              y2={CENTER_Y}
              stroke="#8b5cf6"
              strokeWidth="2"
              strokeDasharray="5,5"
            />

            {/* Sine projection */}
            <Line
              x1={pointX}
              y1={CENTER_Y}
              x2={CENTER_X}
              y2={CENTER_Y}
              stroke="#10b981"
              strokeWidth="2"
              strokeDasharray="5,5"
            />

            {/* Point on circle */}
            <Circle
              cx={pointX}
              cy={pointY}
              r="8"
              fill="#f97316"
              stroke="#fff"
              strokeWidth="2"
            />

            {/* Axis labels */}
            <SvgText x={CIRCLE_SIZE - 10} y={CENTER_Y - 10} fill="#666" fontSize="14" fontWeight="bold">
              x
            </SvgText>
            <SvgText x={CENTER_X + 10} y={15} fill="#666" fontSize="14" fontWeight="bold">
              y
            </SvgText>
          </Svg>
        </View>

        <View style={styles.valuesContainer}>
          <View style={styles.angleContainer}>
            <Text style={styles.angleLabel}>Angle</Text>
            <Text style={styles.angleValue}>{angle}°</Text>
            <Text style={styles.radianValue}>{formatAngleRad()}</Text>
          </View>

          <View style={styles.trigContainer}>
            <View style={styles.trigRow}>
              <View style={styles.trigItem}>
                <Text style={[styles.trigLabel, { color: '#10b981' }]}>sin(θ)</Text>
                <Text style={styles.trigValue}>{formatNumber(sinValue)}</Text>
              </View>
              <View style={styles.trigItem}>
                <Text style={[styles.trigLabel, { color: '#8b5cf6' }]}>cos(θ)</Text>
                <Text style={styles.trigValue}>{formatNumber(cosValue)}</Text>
              </View>
              <View style={styles.trigItem}>
                <Text style={[styles.trigLabel, { color: '#f97316' }]}>tan(θ)</Text>
                <Text style={styles.trigValue}>{formatTan()}</Text>
              </View>
            </View>
          </View>

          <View style={styles.coordinatesContainer}>
            <Text style={styles.coordinatesLabel}>Point Coordinates</Text>
            <Text style={styles.coordinatesValue}>
              ({formatNumber(cosValue)}, {formatNumber(sinValue)})
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
  },
  svgContainer: {
    alignSelf: 'center',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  valuesContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  angleContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  angleLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  angleValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  radianValue: {
    fontSize: 18,
    color: '#475569',
    marginTop: 4,
  },
  trigContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  trigRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  trigItem: {
    alignItems: 'center',
    flex: 1,
  },
  trigLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  trigValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  coordinatesContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  coordinatesLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  coordinatesValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
});