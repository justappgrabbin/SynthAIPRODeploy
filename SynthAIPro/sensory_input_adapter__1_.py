"""
SENSORY INPUT ADAPTER
Converts real-world sensor data into field coordinates for consciousness processing
"""

import numpy as np
from typing import Dict, Any, Optional

class SensoryInputAdapter:
    """
    Translates real sensor data into the field coordinate system
    your consciousness engine understands
    """
    
    def __init__(self):
        # Calibration parameters (tune these based on your sensors)
        self.calibration = {
            'smell': {
                'chemical_sensors': {},  # VOC sensor, e-nose readings
                'scale': 1.0,
                'offset': 0.0
            },
            'taste': {
                'chemical_sensors': {},  # pH, conductivity, specific chemicals
                'scale': 1.0,
                'offset': 0.0
            },
            'touch': {
                'pressure_sensors': {},
                'temperature': {},
                'texture': {}
            },
            'sight': {
                'camera': {},
                'light_sensors': {}
            },
            'hearing': {
                'microphone': {},
                'frequency_analyzer': {}
            }
        }
    
    def smell_from_chemical_data(self, chemical_readings: Dict[str, float]) -> np.ndarray:
        """
        Convert chemical sensor data to 3D smell gradient vector
        
        Args:
            chemical_readings: Dict of chemical concentrations
                e.g. {'VOC_total': 450, 'CO2': 800, 'NH3': 12}
        
        Returns:
            3D gradient vector representing smell direction/intensity
        """
        # Map chemical readings to 3D space
        # Different chemicals map to different axes/directions
        
        gradient = np.zeros(3)
        
        if 'VOC_total' in chemical_readings:
            # VOCs = organic compounds, map to X axis (horizontal spread)
            gradient[0] = self._normalize_chemical(chemical_readings['VOC_total'], 0, 1000)
        
        if 'CO2' in chemical_readings:
            # CO2 = breath/life, map to Y axis (vertical)
            gradient[1] = self._normalize_chemical(chemical_readings['CO2'], 400, 2000)
        
        if 'NH3' in chemical_readings or 'ethanol' in chemical_readings:
            # Ammonia/alcohol = sharp/pungent, map to Z axis (depth)
            val = chemical_readings.get('NH3', 0) + chemical_readings.get('ethanol', 0)
            gradient[2] = self._normalize_chemical(val, 0, 100)
        
        return gradient
    
    def taste_from_chemical_data(self, substance_data: Dict[str, float]) -> float:
        """
        Convert chemical analysis to taste alignment score [-1, 1]
        
        Args:
            substance_data: Chemical properties of substance
                e.g. {'pH': 7.2, 'salinity': 0.5, 'sweetness': 0.8}
        
        Returns:
            Alignment score: positive = pleasant, negative = unpleasant
        """
        alignment = 0.0
        
        # pH influence (neutral is pleasant, extremes unpleasant)
        if 'pH' in substance_data:
            pH = substance_data['pH']
            # Optimal pH around 6-8
            pH_score = 1.0 - abs(pH - 7.0) / 7.0
            alignment += pH_score * 0.3
        
        # Sweetness (positive contribution)
        if 'sweetness' in substance_data:
            alignment += substance_data['sweetness'] * 0.4
        
        # Bitterness (negative contribution)
        if 'bitterness' in substance_data:
            alignment -= substance_data['bitterness'] * 0.5
        
        # Saltiness (moderate is good, extreme is bad)
        if 'salinity' in substance_data:
            salt = substance_data['salinity']
            salt_score = 0.5 - abs(salt - 0.3)
            alignment += salt_score * 0.2
        
        # Umami (positive)
        if 'umami' in substance_data:
            alignment += substance_data['umami'] * 0.3
        
        # Clamp to [-1, 1]
        return np.tanh(alignment)
    
    def touch_from_sensor_data(self, sensor_data: Dict[str, float]) -> float:
        """
        Convert physical sensor readings to touch curvature value
        
        Args:
            sensor_data: Physical measurements
                e.g. {'pressure': 0.5, 'temperature': 25, 'texture_roughness': 0.3}
        
        Returns:
            Curvature value (positive = expansion, negative = contraction)
        """
        curvature = 0.0
        
        if 'pressure' in sensor_data:
            # Higher pressure = positive curvature (expansion/pushing)
            curvature += sensor_data['pressure'] * 2.0 - 1.0
        
        if 'temperature' in sensor_data:
            # Temperature relative to comfortable baseline (25°C)
            temp_diff = (sensor_data['temperature'] - 25) / 20
            curvature += temp_diff * 0.5
        
        return curvature
    
    def sight_from_visual_data(self, visual_data: Dict[str, Any]) -> float:
        """
        Convert camera/visual sensor data to field amplitude
        
        Args:
            visual_data: Visual measurements
                e.g. {'brightness': 0.7, 'contrast': 0.5, 'color_intensity': [0.8, 0.6, 0.4]}
        
        Returns:
            Field amplitude (0 = dark, 1 = bright)
        """
        if 'brightness' in visual_data:
            return visual_data['brightness']
        
        if 'color_intensity' in visual_data:
            # Average RGB intensity
            return np.mean(visual_data['color_intensity'])
        
        return 0.5  # Default neutral
    
    def hearing_from_audio_data(self, audio_data: Dict[str, float]) -> float:
        """
        Convert audio sensor data to frequency
        
        Args:
            audio_data: Audio measurements
                e.g. {'frequency': 440, 'amplitude': 0.8, 'spectrum': [...]}
        
        Returns:
            Dominant frequency in Hz
        """
        if 'frequency' in audio_data:
            return audio_data['frequency']
        
        if 'spectrum' in audio_data:
            # Find peak frequency in spectrum
            spectrum = np.array(audio_data['spectrum'])
            peak_idx = np.argmax(spectrum)
            # Assume spectrum covers 0-20kHz
            return (peak_idx / len(spectrum)) * 20000
        
        return 440.0  # Default A4
    
    def create_perception_from_sensors(self, 
                                       smell_sensors: Optional[Dict] = None,
                                       taste_sensors: Optional[Dict] = None,
                                       touch_sensors: Optional[Dict] = None,
                                       sight_sensors: Optional[Dict] = None,
                                       hearing_sensors: Optional[Dict] = None) -> Dict:
        """
        Create a complete perception dict from all available sensor data
        
        Returns:
            Perception dict compatible with your consciousness system
        """
        perception = {}
        
        if smell_sensors:
            perception['smell'] = self.smell_from_chemical_data(smell_sensors)
        
        if taste_sensors:
            perception['taste'] = self.taste_from_chemical_data(taste_sensors)
        
        if touch_sensors:
            perception['touch'] = self.touch_from_sensor_data(touch_sensors)
        
        if sight_sensors:
            perception['sight'] = self.sight_from_visual_data(sight_sensors)
        
        if hearing_sensors:
            perception['hearing'] = self.hearing_from_audio_data(hearing_sensors)
        
        return perception
    
    def _normalize_chemical(self, value: float, min_val: float, max_val: float) -> float:
        """Normalize chemical reading to [-1, 1] range"""
        normalized = (value - min_val) / (max_val - min_val)  # [0, 1]
        return normalized * 2 - 1  # [-1, 1]


# EXAMPLE USAGE FOR YOUR BOYFRIEND TO SEE
class SensoryDemo:
    """
    Demonstration of how to feed real sensor data to consciousness
    """
    
    def __init__(self):
        self.adapter = SensoryInputAdapter()
    
    def demo_coffee_smell(self):
        """Example: Smelling coffee"""
        # Simulated e-nose sensor readings for coffee
        coffee_chemicals = {
            'VOC_total': 850,  # High volatile organic compounds
            'CO2': 600,
            'ethanol': 15,
            'acetone': 8
        }
        
        smell_vector = self.adapter.smell_from_chemical_data(coffee_chemicals)
        print(f"Coffee smell gradient: {smell_vector}")
        print(f"Magnitude: {np.linalg.norm(smell_vector):.3f}")
        print(f"Direction: X={smell_vector[0]:.2f}, Y={smell_vector[1]:.2f}, Z={smell_vector[2]:.2f}")
    
    def demo_lemon_taste(self):
        """Example: Tasting lemon"""
        lemon_properties = {
            'pH': 2.3,  # Very acidic
            'sweetness': 0.1,
            'bitterness': 0.2,
            'sourness': 0.9
        }
        
        alignment = self.adapter.taste_from_chemical_data(lemon_properties)
        print(f"\nLemon taste alignment: {alignment:.3f}")
        print(f"Interpretation: {'Pleasant' if alignment > 0 else 'Unpleasant'}")
    
    def demo_full_perception(self):
        """Example: Complete sensory experience"""
        # Simulated sensor suite at a coffee shop
        perception = self.adapter.create_perception_from_sensors(
            smell_sensors={'VOC_total': 850, 'CO2': 600},
            taste_sensors={'pH': 7.0, 'sweetness': 0.6},
            touch_sensors={'pressure': 0.4, 'temperature': 22},
            sight_sensors={'brightness': 0.65},
            hearing_sensors={'frequency': 200}  # Low ambient rumble
        )
        
        print("\nFull sensory perception at coffee shop:")
        for sense, value in perception.items():
            print(f"  {sense}: {value}")


if __name__ == "__main__":
    demo = SensoryDemo()
    demo.demo_coffee_smell()
    demo.demo_lemon_taste()
    demo.demo_full_perception()
