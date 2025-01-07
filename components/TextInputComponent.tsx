import React from 'react'
import { StyleSheet, Text, TextInput } from 'react-native'
import { View } from 'react-native'
interface props{
name:string|null,
text:string|null,
setText:(name:string) =>void
placeholder:string
boolean?:boolean

}


export default function TextInputComponent({name,text,setText,placeholder,boolean}:props) {
  return (
    <View
    style={{
      flexDirection: "column",
      alignItems: "flex-start",
      justifyContent: "flex-start",
      width: "100%",
      gap: 5,
    }}
  >
    <Text>{name}</Text>
    <TextInput
      style={styles.input}
      value={text ||""}
      onChangeText={setText}
      placeholder={placeholder}
      editable={boolean}
    
    />
  </View>
  )
}


const styles =StyleSheet.create({
    input: {
        width: "100%",
        borderWidth: 1,
        borderColor: "#ccc",
        padding: 10,
        borderRadius: 5,
        marginBottom: 10,
      },
})