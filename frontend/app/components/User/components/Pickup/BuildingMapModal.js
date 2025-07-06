import React from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    Dimensions,
} from 'react-native';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

const BuildingMapModal = ({ visible, onClose, highlightedStalls = [], normalize = (s) => s?.replace(/[-\s]/g, '').toLowerCase() }) => {
    const renderStall = (stall) => (
        <Text
            key={stall}
            style={[styles.stallBox,
            highlightedStalls.includes(normalize(stall)) ? styles.highlighted : styles.regular]}
        >
            {stall}
        </Text>
    );

    const renderRow = (stalls, rowIndex) => (
        <View style={styles.layoutRow} key={`row-${rowIndex}`}>
            {stalls.map((stall, i) => (
                <Text
                    key={`${stall}-${i}`}
                    style={[styles.stallBox,
                    highlightedStalls.includes(normalize(stall)) ? styles.highlighted : styles.regular]}
                >
                    {stall}
                </Text>
            ))}
        </View>
    );

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
            supportedOrientations={["landscape"]}
        >
            <View style={styles.overlay}>
                <ScrollView contentContainerStyle={{ flexGrow: 1 }} horizontal>
                    <View style={styles.rotatedContainer}>
                        <View style={styles.modalContainer}>
                            <Text style={styles.title}>Building C Layout</Text>

                            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                                <Text style={styles.closeText}>Close</Text>
                            </TouchableOpacity>

                            <View style={styles.legendContainer}>
                                {[{ color: '#22c55e', label: 'Stall/s To Pickup' },
                                { color: '#000000', label: 'Regular Stall' },
                                { color: '#fde68a', label: 'Hallway' },
                                { color: '#ef4444', label: 'Entrance / Exit / Stairs' },
                                { color: '#d1d5db', label: 'BLDG C Office' },
                                ].map((item, idx) => (
                                    <View key={idx} style={styles.legendItem}>
                                        <View style={[styles.colorBox, { backgroundColor: item.color }]} />
                                        <Text style={styles.legendText}>{item.label}</Text>
                                    </View>
                                ))}
                            </View>

                            <View style={styles.mapBody}>
                                {/* Left Vertical Stalls */}
                                <View style={styles.leftColumn}>
                                    {['B-01 S-45', 'B-01 S-44', 'B-01 S-43', 'B-01 S-42', 'B-01 S-41'].map(renderStall)}
                                </View>

                                {/* Center Layout */}
                                <View style={styles.centerBlock}>
                                    {/* LEFT HALF */}
                                    {[ // rows for left half
                                        ['B-04 S-01', 'B-04 S-02', 'B-04 S-03', 'B-04 S-04', 'B-04 S-05', 'B-04 S-06', 'B-04 S-07', 'B-04 S-08', 'B-04 S-09', 'B-04 S-10'],
                                        'HALLWAY',
                                        ['B-03 S-09', 'B-03 S-10', 'B-03 S-11', 'B-03 S-12', 'B-03 S-13', 'B-03 S-14', 'B-03 S-15', 'B-03 S-16', 'B-03 S-17', 'B-03 S-18'],
                                        'HALLWAY',
                                        ['', '', 'B-02 S-11', 'B-02 S-12', 'B-02 S-13', 'B-02 S-14', 'B-02 S-15', 'B-02 S-16', 'B-02 S-17', 'B-02 S-18'],
                                        ['B-02 S-01', 'B-02 S-02', 'B-02 S-03', 'B-02 S-04', 'B-02 S-05', 'B-02 S-06', 'B-02 S-07', 'B-02 S-08', 'B-02 S-09', 'B-02 S-10'],
                                        'HALLWAY',
                                        ['', 'B-01 S-03', '', 'B-01 S-05', '', '', '', '', '', ''],
                                        ['B-01 S-01', 'B-01 S-02', 'B-01 S-04', 'B-01 S-06', 'B-01 S-07', 'B-01 S-08', 'B-01 S-09', 'B-01 S-10', 'B-01 S-11', 'B-01 S-12']
                                    ].map((row, idx) =>
                                        row === 'HALLWAY' ? (
                                            <Text key={`hallway-left-${idx}`} style={styles.sectionHeader}>HALLWAY</Text>
                                        ) : renderRow(row, `left-${idx}`)
                                    )}
                                </View>

                                <View style={styles.centerDivider}>
                                    <Text style={styles.sectionHeaderLarge}>HALLWAY</Text>
                                </View>

                                {/* RIGHT HALF */}
                                <View style={styles.centerBlock}>
                                    {[ // rows for right half
                                        ['B-04 S-11', 'B-04 S-12', 'B-04 S-13', 'B-04 S-14', 'B-04 S-15', 'B-04 S-16', 'B-04 S-17', 'B-04 S-18', 'B-04 S-19', 'B-04 S-20'],
                                        'HALLWAY',
                                        ['B-03 S-21', 'B-03 S-22', 'B-03 S-23', 'B-03 S-24', 'B-03 S-25', 'B-03 S-26', 'B-03 S-27', 'B-03 S-28', 'B-03 S-29', 'B-03 S-30'],
                                        'HALLWAY',
                                        ['B-02 S-19', 'B-02 S-20', 'B-02 S-21', 'B-02 S-22', 'B-02 S-23', 'B-02 S-24', 'B-02 S-25', 'B-02 S-26', 'B-02 S-27', 'B-02 S-28'],
                                        'HALLWAY',
                                        ['B-01 S-24', 'B-01 S-25', 'B-01 S-26', 'B-01 S-27', 'B-01 S-28', 'B-01 S-29', 'B-01 S-30', 'B-01 S-31', 'B-01 S-32', ''],
                                        ['B-01 S-14', 'B-01 S-15', 'B-01 S-16', 'B-01 S-17', 'B-01 S-18', 'B-01 S-19', 'B-01 S-20', 'B-01 S-21', 'B-01 S-22', 'B-01 S-23']
                                    ].map((row, idx) =>
                                        row === 'HALLWAY' ? (
                                            <Text key={`hallway-right-${idx}`} style={styles.sectionHeader}>HALLWAY</Text>
                                        ) : renderRow(row, `right-${idx}`)
                                    )}
                                </View>
                                <View style={styles.centerDivider}>
                                    <Text style={styles.sectionHeaderLarge}>HALLWAY</Text>
                                </View>


                                {/* Right Sidebar */}
                                <View style={styles.sideColumn}>
                                    <View style={[styles.officeBox]}>
                                        <Text style={{ color: '#000', fontWeight: 'bold' }}>BLDG C OFFICE</Text>
                                    </View>
                                    {['B-03 S-31', 'B-03 S-32', 'B-02 S-83', 'B-02 S-84', 'B-01 S-33', 'B-01 S-34', 'B-01 S-35'].map(renderStall)}
                                </View>
                            </View>
                            <Text style={styles.sectionHeaderLower}>HALLWAY</Text>
                            <View style={styles.footer}>
                                <View style={[styles.footerBox, { backgroundColor: '#dc2626' }]}>
                                    <View style={{ alignSelf: 'flex-start', paddingHorizontal: 4 }}>
                                        <Text style={{ color: 'white' }}>Entrance</Text>
                                    </View>
                                </View>
                                <View style={[styles.footerBox, { backgroundColor: '#dc2626' }]}>
                                    <View style={{ alignSelf: 'center', paddingHorizontal: 20 }}>
                                        <Text style={{ color: 'white' }}>Stairs</Text>
                                    </View>
                                </View>
                                <View style={[styles.footerBox, { backgroundColor: '#dc2626' }]}>
                                    <View style={{ alignSelf: 'flex-end', paddingHorizontal: 20 }}>
                                        <Text style={{ color: 'white' }}>Exit</Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </View>
        </Modal>
    );
};

export default BuildingMapModal;

const styles = StyleSheet.create({
    rotatedContainer: {
        transform: [{ rotate: '90deg' }, { scale: 0.8 }],
        width: screenHeight - 400,
        height: screenWidth - 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 200,
        backgroundColor: 'white',
        padding: 20,
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 8,
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white'
    },
    closeButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: 'red',
        borderRadius: 10,
        padding: 4,
        width: 50,
        alignItems: 'center',
        marginRight: 20
    },
    closeText: {
        color: 'white',
        fontWeight: 'bold',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 10,
        textAlign: 'center',
        backgroundColor: 'white',
        padding: 5,
        borderRadius: 20,
    },
    legendContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        justifyContent: 'center',
        marginTop: 5
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 12,
        marginBottom: 6,
    },
    colorBox: {
        width: 14,
        height: 14,
        borderRadius: 2,
        marginRight: 4,
        borderWidth: 1,
        borderColor: '#ccc',
    },
    legendText: {
        fontSize: 12,
        color: '#000',
    },
    mapBody: {
        flexDirection: 'row',
        marginTop: 10,
    },
    layoutRow: {
        flexDirection: 'row',
        marginBottom: 2,
    },
    stallBox: {
        width: screenWidth / 12,
        height: 30,
        borderWidth: 1,
        borderColor: '#ccc',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 1,
        fontSize: 10,
        paddingHorizontal: 4,
    },
    regular: {
        backgroundColor: 'black',
        color: 'white',
    },
    highlighted: {
        backgroundColor: '#065f46',
        color: 'white',
        fontWeight: 'bold',
    },
    sectionHeader: {
        backgroundColor: '#fde68a',
        fontWeight: 'bold',
        color: '#000',
        padding: 6,
        width: '100%',
        textAlign: 'center',
        marginBottom: 4,
    },
    sectionHeaderLower: {
        backgroundColor: '#fde68a',
        fontWeight: 'bold',
        color: '#000',
        padding: 6,
        width: '100%',
        textAlign: 'center',
        marginBottom: 4,
        width: 990
    },
    sectionHeaderLarge: {
        backgroundColor: '#fde68a',
        fontWeight: 'bold',
        color: '#000',
        paddingVertical: 130,
        paddingHorizontal: 6,
        fontSize: 12,
        textAlign: 'center',
        marginTop: 10,
    },
    leftColumn: {
        flexDirection: 'column',
        marginRight: 6,
        marginTop: 132
    },
    centerBlock: {
        flexDirection: 'column',
    },
    centerDivider: {
        marginHorizontal: 4,
    },
    sideColumn: {
        flexDirection: 'column',
        marginLeft: 6,
        justifyContent: 'space-between',
    },
    officeBox: {
        backgroundColor: '#d1d5db',
        padding: 10,
        alignItems: 'center',
        marginBottom: 2,
        borderWidth: 1,
        borderColor: '#999',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 16,
        width: 990,
        backgroundColor: 'white'
    },
    footerBox: {
        paddingVertical: 8,
        paddingHorizontal: 1,
        borderRadius: 6,
        flexDirection: 'row'
    },
});
