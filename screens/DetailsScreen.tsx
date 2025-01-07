import React from 'react';
import { View, Text, Button } from 'react-native';

const DetailsScreen = ({ navigation }: any) => {
    return (
        <View>
            <Text>Details Screen</Text>
            <Button title="Go back" onPress={() => navigation.goBack()} />
        </View>
    );
};

export default DetailsScreen;
