import React, { useState } from "react";
import { Modal, Pressable, useWindowDimensions, View } from "react-native";
import RenderHTML, {
  HTMLContentModel,
  HTMLElementModel,
  useInternalRenderer,
} from "react-native-render-html";

function CustomImageRenderer(props) {
  const { width, height } = useWindowDimensions();
  const { Renderer, rendererProps } = useInternalRenderer("img", props);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const onPress = () => {
    setIsModalOpen((pre) => !pre);
  };
  const onModalClose = () => setIsModalOpen(false);

  return (
    <View>
      <Renderer {...rendererProps} onPress={onPress} />
      <Modal
        transparent={true}
        visible={isModalOpen}
        animationType="fade"
        onRequestClose={onModalClose}
      >
        <Pressable
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            flexGrow: 1,
            alignItems: "center",
            justifyContent: "center",
          }}
          onPress={onModalClose}
        >
          <Renderer {...rendererProps} style={{ width: width }} />
        </Pressable>
      </Modal>
    </View>
  );
}

const CardRenderHtml = ({ source }) => {
  const { width, height } = useWindowDimensions();
  const tagsStyles = {
    img: {
      alignSelf: "center",
      width: width - 150,
    },
    p: {
      alignSelf: "center",
      fontSize: 17,
    },
  };
  const renderers = {
    img: CustomImageRenderer,
  };

  const customHTMLElementModels = {
    html: HTMLElementModel.fromCustomModel({
      tagName: "html",
      contentModel: HTMLContentModel.block,
    }),
  };

  return (
    <RenderHTML
      contentWidth={width}
      source={{ html: source }}
      tagsStyles={tagsStyles}
      renderers={renderers}
      baseStyle={{
        paddingHorizontal: 5,
      }}
      customHTMLElementModels={customHTMLElementModels}
    />
  );
};

export default CardRenderHtml;
