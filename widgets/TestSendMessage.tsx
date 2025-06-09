import { sendWidgetData } from '@/utils/widget/send-data';
import { StyleSheet } from 'react-native'
import { Text,Surface, Button } from 'react-native-paper';
 
export function TestSendMessage(){
return (
<Surface style={{ ...styles.container }}>
    <Text variant='titleLarge'>TestSendMessage</Text>
    <Button
      mode="contained"
      onPress={() => {
        sendWidgetData()
      }}
      style={{ marginTop: 20 }}
    >
      Send Message
    </Button>
</Surface>
);
}
const styles = StyleSheet.create({
container:{
    padding: 10,
   width: '100%',
  justifyContent: 'center',
  alignItems: 'center',
}
})
