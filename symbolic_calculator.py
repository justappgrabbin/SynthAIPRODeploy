"""
AION Symbolic Computation Engine
Calculates Human Design, Astrology, I Ching, and cross-framework correspondences
"""

import math
import json
import random
from datetime import datetime
from typing import Dict, List, Tuple, Optional

class SymbolicCalculator:
    def __init__(self):
        self.hexagram_data = {i: {'name': f"Hexagram {i}", 'meaning': f"Meaning for hexagram {i}", 'trigrams': ['Heaven', 'Earth'] if i % 2 == 1 else ['Earth', 'Heaven']} for i in range(1, 65)}
        self.gate_to_hexagram = {str(i): i for i in range(1, 65)}

    def calculate_human_design(self, birth_date: str, birth_time: str, birth_location: str) -> Dict:
        dt = datetime.fromisoformat(f"{birth_date}T{birth_time}")
        type_hash = hash(f"{birth_date}{birth_time}{birth_location}") % 100
        types = ['Manifestor', 'Generator', 'Manifesting Generator', 'Projector', 'Reflector']
        type_weights = [10, 35, 30, 20, 5]
        cumulative = 0
        hd_type = types[0]
        for t, w in zip(types, type_weights):
            cumulative += w
            if type_hash < cumulative:
                hd_type = t
                break
        profiles = ['1/3', '1/4', '2/4', '2/5', '3/5', '3/6', '4/6', '4/1', '5/1', '5/2', '6/2', '6/3']
        profile = profiles[hash(f"{birth_date}{birth_time}") % len(profiles)]
        authorities = ['Sacral', 'Emotional Solar Plexus', 'Splenic', 'Ego/Heart', 'G-Center/Self', 'Environmental', 'Lunar', 'None (Mental)']
        authority = authorities[hash(f"{birth_location}{birth_date}") % len(authorities)]
        strategies = {'Manifestor': 'To Inform', 'Generator': 'Wait to Respond', 'Manifesting Generator': 'Wait to Respond, then Inform', 'Projector': 'Wait for the Invitation', 'Reflector': 'Wait a Lunar Cycle'}
        strategy = strategies.get(hd_type, 'Wait')
        center_names = ['Head', 'Ajna', 'Throat', 'G-Center', 'Heart', 'Solar Plexus', 'Sacral', 'Spleen', 'Root']
        defined_centers = [c for c in center_names if hash(f"{c}{birth_date}{birth_time}") % 100 < 40]
        gates = [str(i) for i in range(1, 65) if hash(f"gate{i}{birth_date}{birth_time}") % 100 < 15]
        channel_pairs = [('1', '8'), ('2', '14'), ('3', '60'), ('4', '63'), ('5', '15'), ('6', '59'), ('7', '31'), ('9', '52'), ('10', '20'), ('10', '34'), ('10', '57'), ('11', '56'), ('12', '22'), ('13', '33'), ('16', '48'), ('17', '62'), ('18', '58'), ('19', '49'), ('20', '34'), ('20', '57'), ('21', '45'), ('23', '43'), ('24', '61'), ('25', '51'), ('26', '44'), ('27', '50'), ('28', '38'), ('29', '46'), ('30', '41'), ('32', '54'), ('34', '57'), ('35', '36'), ('37', '40'), ('39', '55'), ('42', '53'), ('47', '64'), ('50', '27')]
        channels = [f"{a}-{b}" for a, b in channel_pairs if a in gates and b in gates]
        crosses = ["Right Angle Cross of the Sleeping Phoenix", "Right Angle Cross of the Four Ways", "Right Angle Cross of Penetration", "Left Angle Cross of the Clarion", "Left Angle Cross of Duality", "Juxtaposition Cross of Intuition", "Juxtaposition Cross of Power"]
        incarnation_cross = crosses[hash(f"{birth_date}{birth_time}{birth_location}") % len(crosses)]
        return {'type': hd_type, 'strategy': strategy, 'authority': authority, 'profile': profile, 'centers': {'defined': defined_centers, 'undefined': [c for c in center_names if c not in defined_centers], 'open': []}, 'gates': gates, 'channels': channels, 'incarnation_cross': incarnation_cross, 'variables': {'digestion': ['Appetite'], 'environment': ['Caves'], 'motivation': ['Need'], 'perspective': ['Power'], 'awareness': ['Survival']}}

    def cast_i_ching(self, question: str = "", method: str = "temporal") -> Dict:
        if method == "temporal":
            random.seed(int(datetime.now().timestamp() * 1000))
        lines = []
        for i in range(6):
            coins = [random.choice([2, 3]) for _ in range(3)]
            total = sum(coins)
            if total == 6:
                lines.append({'position': i + 1, 'value': 6, 'type': 'old_yin', 'changing': True, 'symbol': '--- x ---', 'binary': 0})
            elif total == 7:
                lines.append({'position': i + 1, 'value': 7, 'type': 'young_yang', 'changing': False, 'symbol': '---------', 'binary': 1})
            elif total == 8:
                lines.append({'position': i + 1, 'value': 8, 'type': 'young_yin', 'changing': False, 'symbol': '---   ---', 'binary': 0})
            elif total == 9:
                lines.append({'position': i + 1, 'value': 9, 'type': 'old_yang', 'changing': True, 'symbol': '----o----', 'binary': 1})
        primary_binary = ''.join(str(line['binary']) for line in reversed(lines))
        primary_number = int(primary_binary, 2) + 1 if primary_binary else 1
        relating_lines = []
        for line in lines:
            if line['changing']:
                relating_lines.append({'binary': 1 - line['binary'], 'symbol': '---------' if line['binary'] == 0 else '---   ---'})
            else:
                relating_lines.append(line)
        relating_binary = ''.join(str(line['binary']) for line in reversed(relating_lines))
        relating_number = int(relating_binary, 2) + 1 if relating_binary else 1
        changing_lines = [line['position'] for line in lines if line['changing']]
        return {'question': question, 'method': method, 'lines': lines, 'primary_hexagram': {'number': primary_number, 'name': self.hexagram_data.get(primary_number, {}).get('name', 'Unknown'), 'meaning': self.hexagram_data.get(primary_number, {}).get('meaning', '')}, 'relating_hexagram': {'number': relating_number, 'name': self.hexagram_data.get(relating_number, {}).get('name', 'Unknown'), 'meaning': self.hexagram_data.get(relating_number, {}).get('meaning', '')} if changing_lines else None, 'changing_lines': changing_lines, 'reading': self._generate_reading(lines, primary_number, changing_lines)}

    def calculate_astrology(self, birth_date: str, birth_time: str, birth_location: str) -> Dict:
        planets_list = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto']
        signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces']
        houses = [f"House {i}" for i in range(1, 13)]
        chart = {}
        for planet in planets_list:
            position = hash(f"{planet}{birth_date}{birth_time}") % 360
            sign_index = position // 30
            degree_in_sign = position % 30
            chart[planet] = {'sign': signs[sign_index], 'degree': degree_in_sign, 'house': houses[hash(f"{planet}{birth_location}") % 12], 'retrograde': hash(f"retro{planet}{birth_date}") % 100 < 20}
        aspects = []
        aspect_types = [('conjunction', 0, 8), ('sextile', 60, 6), ('square', 90, 8), ('trine', 120, 8), ('opposition', 180, 8)]
        for i, p1 in enumerate(planets_list):
            for p2 in planets_list[i+1:]:
                pos1 = hash(f"{p1}{birth_date}{birth_time}") % 360
                pos2 = hash(f"{p2}{birth_date}{birth_time}") % 360
                diff = abs(pos1 - pos2)
                if diff > 180: diff = 360 - diff
                for aspect_name, angle, orb in aspect_types:
                    if abs(diff - angle) <= orb:
                        aspects.append({'planet1': p1, 'planet2': p2, 'aspect': aspect_name, 'orb': abs(diff - angle), 'degree': diff})
        return {'planets': chart, 'aspects': aspects, 'birth_data': {'date': birth_date, 'time': birth_time, 'location': birth_location}}

    def cross_translate(self, framework_a: str, data_a: Dict, framework_b: str) -> Dict:
        if framework_a == 'i_ching' and framework_b == 'human_design':
            return self._i_ching_to_human_design(data_a)
        elif framework_a == 'human_design' and framework_b == 'astrology':
            return self._human_design_to_astrology(data_a)
        elif framework_a == 'astrology' and framework_b == 'i_ching':
            return self._astrology_to_i_ching(data_a)
        else:
            return {'error': f'Translation from {framework_a} to {framework_b} not yet implemented'}

    def _i_ching_to_human_design(self, i_ching_data: Dict) -> Dict:
        hex_num = i_ching_data.get('primary_hexagram', {}).get('number', 1)
        gate = str(hex_num)
        return {'gate': gate, 'center': self._gate_to_center(gate), 'channel': self._gate_to_channel(gate), 'profile_resonance': self._hexagram_to_profile(hex_num), 'type_resonance': self._hexagram_to_type(hex_num)}

    def _human_design_to_astrology(self, hd_data: Dict) -> Dict:
        gates = hd_data.get('gates', [])
        planetary_correspondences = {}
        for gate in gates:
            gate_num = int(gate)
            planet_index = (gate_num - 1) % 10
            planets_list = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto']
            planetary_correspondences[gate] = planets_list[planet_index]
        return {'planetary_correspondences': planetary_correspondences, 'house_resonance': {gate: f"House {(int(gate) % 12) + 1}" for gate in gates}, 'sign_resonance': {gate: ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'][int(gate) % 12] for gate in gates}}

    def _astrology_to_i_ching(self, astro_data: Dict) -> Dict:
        planets = astro_data.get('planets', {})
        hexagrams = {}
        for planet, data in planets.items():
            sign = data['sign']
            degree = data['degree']
            sign_index = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'].index(sign)
            hex_num = (sign_index * 5 + int(degree / 6)) % 64 + 1
            hexagrams[planet] = {'hexagram_number': hex_num, 'hexagram_name': self.hexagram_data.get(hex_num, {}).get('name', 'Unknown'), 'line': int(degree / 6) + 1}
        return hexagrams

    def _gate_to_center(self, gate: str) -> str:
        centers = {'1': 'G-Center', '2': 'Sacral', '3': 'Sacral', '4': 'Ajna', '5': 'Sacral', '6': 'Solar Plexus', '7': 'G-Center', '8': 'Throat', '9': 'Sacral', '10': 'G-Center', '11': 'Ajna', '12': 'Throat', '13': 'G-Center', '14': 'Sacral', '15': 'G-Center', '16': 'Throat', '17': 'Ajna', '18': 'Spleen', '19': 'Root', '20': 'Throat', '21': 'Heart', '22': 'Solar Plexus', '23': 'Throat', '24': 'Ajna', '25': 'G-Center', '26': 'Heart', '27': 'Sacral', '28': 'Spleen', '29': 'Sacral', '30': 'Solar Plexus', '31': 'Throat', '32': 'Spleen', '33': 'Throat', '34': 'Sacral', '35': 'Throat', '36': 'Solar Plexus', '37': 'Solar Plexus', '38': 'Throat', '39': 'Root', '40': 'Heart', '41': 'Root', '42': 'Sacral', '43': 'Ajna', '44': 'Spleen', '45': 'Throat', '46': 'G-Center', '47': 'Ajna', '48': 'Spleen', '49': 'Solar Plexus', '50': 'Sacral', '51': 'Heart', '52': 'Root', '53': 'Root', '54': 'Sacral', '55': 'Solar Plexus', '56': 'Throat', '57': 'Spleen', '58': 'Root', '59': 'Sacral', '60': 'Root', '61': 'Ajna', '62': 'Throat', '63': 'Ajna', '64': 'Head'}
        return centers.get(gate, 'Unknown')

    def _gate_to_channel(self, gate: str) -> List[str]:
        channels = {'1': ['1-8'], '2': ['2-14'], '3': ['3-60'], '4': ['4-63'], '5': ['5-15'], '6': ['6-59'], '7': ['7-31'], '8': ['1-8'], '9': ['9-52'], '10': ['10-20', '10-34', '10-57'], '11': ['11-56'], '12': ['12-22'], '13': ['13-33'], '14': ['2-14'], '15': ['5-15'], '16': ['16-48'], '17': ['17-62'], '18': ['18-58'], '19': ['19-49'], '20': ['10-20', '20-34', '20-57'], '21': ['21-45'], '22': ['12-22'], '23': ['23-43'], '24': ['24-61'], '25': ['25-51'], '26': ['26-44'], '27': ['27-50'], '28': ['28-38'], '29': ['29-46'], '30': ['30-41'], '31': ['7-31'], '32': ['32-54'], '33': ['13-33'], '34': ['10-34', '20-34', '34-57'], '35': ['35-36'], '36': ['35-36'], '37': ['37-40'], '38': ['28-38'], '39': ['39-55'], '40': ['37-40'], '41': ['30-41'], '42': ['42-53'], '43': ['23-43'], '44': ['26-44'], '45': ['21-45'], '46': ['29-46'], '47': ['47-64'], '48': ['16-48'], '49': ['19-49'], '50': ['27-50'], '51': ['25-51'], '52': ['9-52'], '53': ['42-53'], '54': ['32-54'], '55': ['39-55'], '56': ['11-56'], '57': ['10-57', '20-34', '34-57'], '58': ['18-58'], '59': ['6-59'], '60': ['3-60'], '61': ['24-61'], '62': ['17-62'], '63': ['4-63'], '64': ['47-64']}
        return channels.get(gate, [])

    def _hexagram_to_profile(self, hex_num: int) -> str:
        return ['1/3', '2/4', '3/5', '4/6', '5/1', '5/2', '6/2', '6/3'][hex_num % 8]

    def _hexagram_to_type(self, hex_num: int) -> str:
        return ['Manifestor', 'Generator', 'Projector', 'Reflector'][hex_num % 4]

    def _generate_reading(self, lines: List[Dict], hex_num: int, changing_lines: List[int]) -> str:
        if not changing_lines:
            return f"The situation is stable. Focus on the qualities of {self.hexagram_data.get(hex_num, {}).get('name', 'this hexagram')}."
        return f"Change is present in lines {', '.join(map(str, changing_lines))}. Pay attention to these areas of transformation."

__all__ = ['SymbolicCalculator']
